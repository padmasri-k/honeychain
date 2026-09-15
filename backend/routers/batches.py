from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_db
from models.user import User, UserRole
from models.batch import Batch, BatchStatus, HoneyVariety
from models.hive import Hive
from services.auth_service import get_current_user, require_role
from services.blockchain_service import create_genesis_block, add_block
from services.qr_service import generate_qr_code

router = APIRouter(prefix="/api/batches", tags=["Batches"])


# --- Schemas ---
class BatchCreate(BaseModel):
    hive_id: int
    variety: str = "multiflora"
    harvest_date: str
    quantity_kg: float
    moisture_pct: Optional[float] = None
    color_grade: Optional[str] = None
    hmf_level: Optional[float] = None
    notes: Optional[str] = None


class BatchResponse(BaseModel):
    id: int
    batch_code: str
    hive_id: int
    hive_name: Optional[str] = None
    beekeeper_id: int
    beekeeper_name: Optional[str] = None
    variety: str
    harvest_date: str
    quantity_kg: float
    moisture_pct: Optional[float]
    color_grade: Optional[str]
    hmf_level: Optional[float]
    purity_score: Optional[float]
    status: str
    qr_code_path: Optional[str]
    notes: Optional[str]
    created_at: Optional[str]
    event_count: int = 0
    blockchain_length: int = 0

    class Config:
        from_attributes = True


# --- Endpoints ---
@router.get("/", response_model=List[BatchResponse])
def list_batches(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List batches. Beekeepers see their own; others see batches relevant to their role."""
    query = db.query(Batch)

    if current_user.role == UserRole.BEEKEEPER:
        query = query.filter(Batch.beekeeper_id == current_user.id)
    elif current_user.role != UserRole.ADMIN:
        # Processors, distributors, retailers see batches they're the current holder of
        # plus all batches for visibility
        pass  # Show all batches for supply chain visibility

    if status_filter:
        try:
            batch_status = BatchStatus(status_filter)
            query = query.filter(Batch.status == batch_status)
        except ValueError:
            pass

    batches = query.order_by(Batch.created_at.desc()).all()
    results = []
    for batch in batches:
        hive = db.query(Hive).filter(Hive.id == batch.hive_id).first()
        beekeeper = db.query(User).filter(User.id == batch.beekeeper_id).first()
        results.append(BatchResponse(
            id=batch.id,
            batch_code=batch.batch_code,
            hive_id=batch.hive_id,
            hive_name=hive.name if hive else None,
            beekeeper_id=batch.beekeeper_id,
            beekeeper_name=beekeeper.name if beekeeper else None,
            variety=batch.variety.value if batch.variety else "multiflora",
            harvest_date=str(batch.harvest_date),
            quantity_kg=batch.quantity_kg,
            moisture_pct=batch.moisture_pct,
            color_grade=batch.color_grade,
            hmf_level=batch.hmf_level,
            purity_score=batch.purity_score,
            status=batch.status.value if batch.status else "harvested",
            qr_code_path=batch.qr_code_path,
            notes=batch.notes,
            created_at=str(batch.created_at) if batch.created_at else None,
            event_count=len(batch.supply_chain_events),
            blockchain_length=len(batch.blocks),
        ))
    return results


@router.get("/{batch_id}", response_model=BatchResponse)
def get_batch(batch_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific batch."""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    hive = db.query(Hive).filter(Hive.id == batch.hive_id).first()
    beekeeper = db.query(User).filter(User.id == batch.beekeeper_id).first()
    return BatchResponse(
        id=batch.id,
        batch_code=batch.batch_code,
        hive_id=batch.hive_id,
        hive_name=hive.name if hive else None,
        beekeeper_id=batch.beekeeper_id,
        beekeeper_name=beekeeper.name if beekeeper else None,
        variety=batch.variety.value if batch.variety else "multiflora",
        harvest_date=str(batch.harvest_date),
        quantity_kg=batch.quantity_kg,
        moisture_pct=batch.moisture_pct,
        color_grade=batch.color_grade,
        hmf_level=batch.hmf_level,
        purity_score=batch.purity_score,
        status=batch.status.value if batch.status else "harvested",
        qr_code_path=batch.qr_code_path,
        notes=batch.notes,
        created_at=str(batch.created_at) if batch.created_at else None,
        event_count=len(batch.supply_chain_events),
        blockchain_length=len(batch.blocks),
    )


@router.get("/code/{batch_code}", response_model=BatchResponse)
def get_batch_by_code(batch_code: str, db: Session = Depends(get_db)):
    """Get a batch by its code (public endpoint for consumer verification)."""
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    hive = db.query(Hive).filter(Hive.id == batch.hive_id).first()
    beekeeper = db.query(User).filter(User.id == batch.beekeeper_id).first()
    return BatchResponse(
        id=batch.id,
        batch_code=batch.batch_code,
        hive_id=batch.hive_id,
        hive_name=hive.name if hive else None,
        beekeeper_id=batch.beekeeper_id,
        beekeeper_name=beekeeper.name if beekeeper else None,
        variety=batch.variety.value if batch.variety else "multiflora",
        harvest_date=str(batch.harvest_date),
        quantity_kg=batch.quantity_kg,
        moisture_pct=batch.moisture_pct,
        color_grade=batch.color_grade,
        hmf_level=batch.hmf_level,
        purity_score=batch.purity_score,
        status=batch.status.value if batch.status else "harvested",
        qr_code_path=batch.qr_code_path,
        notes=batch.notes,
        created_at=str(batch.created_at) if batch.created_at else None,
        event_count=len(batch.supply_chain_events),
        blockchain_length=len(batch.blocks),
    )


@router.post("/", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    req: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.BEEKEEPER, UserRole.ADMIN)),
):
    """Create a new honey batch with blockchain genesis block and QR code."""
    # Verify hive belongs to current user
    hive = db.query(Hive).filter(Hive.id == req.hive_id).first()
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    if current_user.role != UserRole.ADMIN and hive.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Hive does not belong to you")

    # Generate unique batch code
    batch_code = f"HC-{uuid.uuid4().hex[:8].upper()}"

    # Validate variety
    try:
        variety = HoneyVariety(req.variety)
    except ValueError:
        variety = HoneyVariety.OTHER

    batch = Batch(
        batch_code=batch_code,
        hive_id=req.hive_id,
        beekeeper_id=current_user.id,
        variety=variety,
        harvest_date=datetime.fromisoformat(req.harvest_date),
        quantity_kg=req.quantity_kg,
        moisture_pct=req.moisture_pct,
        color_grade=req.color_grade,
        hmf_level=req.hmf_level,
        notes=req.notes,
        current_holder_id=current_user.id,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    # Create blockchain genesis block
    create_genesis_block(db, batch.id)

    # Add harvest event block
    add_block(db, batch.id, {
        "event": "harvested",
        "actor": current_user.name,
        "actor_role": current_user.role.value,
        "quantity_kg": req.quantity_kg,
        "hive": hive.name,
        "location": hive.location_name,
        "timestamp": str(datetime.utcnow()),
    })

    # Generate QR code
    qr_result = generate_qr_code(batch_code)
    batch.qr_code_path = qr_result["filename"]
    db.commit()
    db.refresh(batch)

    return BatchResponse(
        id=batch.id,
        batch_code=batch.batch_code,
        hive_id=batch.hive_id,
        hive_name=hive.name,
        beekeeper_id=batch.beekeeper_id,
        beekeeper_name=current_user.name,
        variety=batch.variety.value,
        harvest_date=str(batch.harvest_date),
        quantity_kg=batch.quantity_kg,
        moisture_pct=batch.moisture_pct,
        color_grade=batch.color_grade,
        hmf_level=batch.hmf_level,
        purity_score=batch.purity_score,
        status=batch.status.value,
        qr_code_path=batch.qr_code_path,
        notes=batch.notes,
        created_at=str(batch.created_at),
        event_count=1,
        blockchain_length=2,
    )


@router.patch("/{batch_id}/status")
def update_batch_status(
    batch_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update batch status."""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    try:
        batch.status = BatchStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    batch.current_holder_id = current_user.id
    db.commit()
    return {"message": f"Batch status updated to {new_status}"}
