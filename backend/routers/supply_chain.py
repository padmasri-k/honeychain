from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

from database import get_db
from models.user import User
from models.batch import Batch
from models.supply_chain import SupplyChainEvent, EventType
from services.auth_service import get_current_user
from services.blockchain_service import add_block

router = APIRouter(prefix="/api/supply-chain", tags=["Supply Chain"])


# --- Schemas ---
class EventCreate(BaseModel):
    batch_id: int
    event_type: str
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    metadata: Optional[dict] = None


class EventResponse(BaseModel):
    id: int
    batch_id: int
    batch_code: Optional[str] = None
    actor_id: int
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    event_type: str
    description: Optional[str]
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    metadata_json: Optional[str]
    block_hash: Optional[str]
    timestamp: Optional[str]

    class Config:
        from_attributes = True


# --- Endpoints ---
@router.get("/batch/{batch_id}", response_model=List[EventResponse])
def get_batch_events(
    batch_id: int,
    db: Session = Depends(get_db),
):
    """Get all supply chain events for a batch (public for consumer verification)."""
    events = (
        db.query(SupplyChainEvent)
        .filter(SupplyChainEvent.batch_id == batch_id)
        .order_by(SupplyChainEvent.timestamp.asc())
        .all()
    )

    batch = db.query(Batch).filter(Batch.id == batch_id).first()

    results = []
    for event in events:
        actor = db.query(User).filter(User.id == event.actor_id).first()
        results.append(EventResponse(
            id=event.id,
            batch_id=event.batch_id,
            batch_code=batch.batch_code if batch else None,
            actor_id=event.actor_id,
            actor_name=actor.name if actor else None,
            actor_role=actor.role.value if actor else None,
            event_type=event.event_type.value if event.event_type else None,
            description=event.description,
            location=event.location,
            latitude=event.latitude,
            longitude=event.longitude,
            metadata_json=event.metadata_json,
            block_hash=event.block_hash,
            timestamp=str(event.timestamp) if event.timestamp else None,
        ))
    return results


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def add_event(
    req: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a supply chain event and record it on the blockchain."""
    # Verify batch exists
    batch = db.query(Batch).filter(Batch.id == req.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Validate event type
    try:
        event_type = EventType(req.event_type)
    except ValueError:
        valid_types = ", ".join(e.value for e in EventType)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid event type. Must be one of: {valid_types}",
        )

    # Prepare event data for blockchain
    event_data = {
        "event": event_type.value,
        "actor": current_user.name,
        "actor_id": current_user.id,
        "actor_role": current_user.role.value,
        "batch_code": batch.batch_code,
        "description": req.description,
        "location": req.location,
        "timestamp": str(datetime.utcnow()),
    }
    if req.metadata:
        event_data["extra"] = req.metadata

    # Add to blockchain
    new_block = add_block(db, req.batch_id, event_data)

    # Create supply chain event
    event = SupplyChainEvent(
        batch_id=req.batch_id,
        actor_id=current_user.id,
        event_type=event_type,
        description=req.description,
        location=req.location,
        latitude=req.latitude,
        longitude=req.longitude,
        metadata_json=json.dumps(req.metadata) if req.metadata else None,
        block_hash=new_block.hash,
    )
    db.add(event)

    # Update batch status based on event type
    status_map = {
        EventType.LAB_TESTED: "testing",
        EventType.PROCESSED: "processing",
        EventType.PACKAGED: "packaged",
        EventType.DISPATCHED: "in_transit",
        EventType.DISTRIBUTED: "delivered",
        EventType.RETAILED: "delivered",
        EventType.SOLD: "sold",
    }
    from models.batch import BatchStatus
    if event_type in status_map:
        try:
            batch.status = BatchStatus(status_map[event_type])
        except ValueError:
            pass

    batch.current_holder_id = current_user.id
    db.commit()
    db.refresh(event)

    return EventResponse(
        id=event.id,
        batch_id=event.batch_id,
        batch_code=batch.batch_code,
        actor_id=event.actor_id,
        actor_name=current_user.name,
        actor_role=current_user.role.value,
        event_type=event.event_type.value,
        description=event.description,
        location=event.location,
        latitude=event.latitude,
        longitude=event.longitude,
        metadata_json=event.metadata_json,
        block_hash=event.block_hash,
        timestamp=str(event.timestamp),
    )
