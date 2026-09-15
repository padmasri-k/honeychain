from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database import get_db
from models.user import User, UserRole
from models.hive import Hive, HiveStatus
from services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/api/hives", tags=["Hives"])


# --- Schemas ---
class HiveCreate(BaseModel):
    name: str
    location_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    bee_species: Optional[str] = None
    flora_source: Optional[str] = None
    hive_type: str = "Langstroth"
    colony_strength: Optional[int] = None
    notes: Optional[str] = None


class HiveUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    bee_species: Optional[str] = None
    flora_source: Optional[str] = None
    colony_strength: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class HiveResponse(BaseModel):
    id: int
    owner_id: int
    owner_name: Optional[str] = None
    name: str
    location_name: Optional[str]
    location_lat: Optional[float]
    location_lng: Optional[float]
    bee_species: Optional[str]
    flora_source: Optional[str]
    hive_type: str
    colony_strength: Optional[int]
    status: str
    notes: Optional[str]
    registered_at: Optional[str]
    last_inspection: Optional[str]
    batch_count: int = 0

    class Config:
        from_attributes = True


# --- Endpoints ---
@router.get("/", response_model=List[HiveResponse])
def list_hives(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List hives. Beekeepers see their own; admins see all."""
    query = db.query(Hive)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(Hive.owner_id == current_user.id)

    hives = query.order_by(Hive.registered_at.desc()).all()
    results = []
    for hive in hives:
        owner = db.query(User).filter(User.id == hive.owner_id).first()
        results.append(HiveResponse(
            id=hive.id,
            owner_id=hive.owner_id,
            owner_name=owner.name if owner else None,
            name=hive.name,
            location_name=hive.location_name,
            location_lat=hive.location_lat,
            location_lng=hive.location_lng,
            bee_species=hive.bee_species,
            flora_source=hive.flora_source,
            hive_type=hive.hive_type,
            colony_strength=hive.colony_strength,
            status=hive.status.value if hive.status else "active",
            notes=hive.notes,
            registered_at=str(hive.registered_at) if hive.registered_at else None,
            last_inspection=str(hive.last_inspection) if hive.last_inspection else None,
            batch_count=hive.batches.count(),
        ))
    return results


@router.get("/{hive_id}", response_model=HiveResponse)
def get_hive(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific hive."""
    hive = db.query(Hive).filter(Hive.id == hive_id).first()
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")

    if current_user.role != UserRole.ADMIN and hive.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = db.query(User).filter(User.id == hive.owner_id).first()
    return HiveResponse(
        id=hive.id,
        owner_id=hive.owner_id,
        owner_name=owner.name if owner else None,
        name=hive.name,
        location_name=hive.location_name,
        location_lat=hive.location_lat,
        location_lng=hive.location_lng,
        bee_species=hive.bee_species,
        flora_source=hive.flora_source,
        hive_type=hive.hive_type,
        colony_strength=hive.colony_strength,
        status=hive.status.value if hive.status else "active",
        notes=hive.notes,
        registered_at=str(hive.registered_at) if hive.registered_at else None,
        last_inspection=str(hive.last_inspection) if hive.last_inspection else None,
        batch_count=hive.batches.count(),
    )


@router.post("/", response_model=HiveResponse, status_code=status.HTTP_201_CREATED)
def create_hive(
    req: HiveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.BEEKEEPER, UserRole.ADMIN)),
):
    """Create a new hive (beekeepers and admins only)."""
    hive = Hive(
        owner_id=current_user.id,
        name=req.name,
        location_name=req.location_name,
        location_lat=req.location_lat,
        location_lng=req.location_lng,
        bee_species=req.bee_species,
        flora_source=req.flora_source,
        hive_type=req.hive_type,
        colony_strength=req.colony_strength,
        notes=req.notes,
    )
    db.add(hive)
    db.commit()
    db.refresh(hive)

    return HiveResponse(
        id=hive.id,
        owner_id=hive.owner_id,
        owner_name=current_user.name,
        name=hive.name,
        location_name=hive.location_name,
        location_lat=hive.location_lat,
        location_lng=hive.location_lng,
        bee_species=hive.bee_species,
        flora_source=hive.flora_source,
        hive_type=hive.hive_type,
        colony_strength=hive.colony_strength,
        status=hive.status.value,
        notes=hive.notes,
        registered_at=str(hive.registered_at),
        last_inspection=None,
        batch_count=0,
    )


@router.put("/{hive_id}", response_model=HiveResponse)
def update_hive(
    hive_id: int,
    req: HiveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a hive."""
    hive = db.query(Hive).filter(Hive.id == hive_id).first()
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")

    if current_user.role != UserRole.ADMIN and hive.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    update_data = req.model_dump(exclude_unset=True)
    if "status" in update_data:
        try:
            update_data["status"] = HiveStatus(update_data["status"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    for key, value in update_data.items():
        setattr(hive, key, value)

    db.commit()
    db.refresh(hive)

    return HiveResponse(
        id=hive.id,
        owner_id=hive.owner_id,
        owner_name=current_user.name,
        name=hive.name,
        location_name=hive.location_name,
        location_lat=hive.location_lat,
        location_lng=hive.location_lng,
        bee_species=hive.bee_species,
        flora_source=hive.flora_source,
        hive_type=hive.hive_type,
        colony_strength=hive.colony_strength,
        status=hive.status.value,
        notes=hive.notes,
        registered_at=str(hive.registered_at),
        last_inspection=str(hive.last_inspection) if hive.last_inspection else None,
        batch_count=hive.batches.count(),
    )


@router.delete("/{hive_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hive(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a hive."""
    hive = db.query(Hive).filter(Hive.id == hive_id).first()
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")

    if current_user.role != UserRole.ADMIN and hive.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(hive)
    db.commit()
