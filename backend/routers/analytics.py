from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.user import User, UserRole
from models.hive import Hive, HiveStatus
from models.batch import Batch, BatchStatus, HoneyVariety
from models.supply_chain import SupplyChainEvent
from models.blockchain import Block
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics based on user role."""
    stats = {}

    if current_user.role == UserRole.BEEKEEPER:
        stats = _beekeeper_stats(db, current_user.id)
    elif current_user.role == UserRole.ADMIN:
        stats = _admin_stats(db)
    else:
        stats = _supply_chain_stats(db, current_user)

    return stats


def _beekeeper_stats(db: Session, user_id: int) -> dict:
    """Stats for beekeeper dashboard."""
    total_hives = db.query(Hive).filter(Hive.owner_id == user_id).count()
    active_hives = db.query(Hive).filter(Hive.owner_id == user_id, Hive.status == HiveStatus.ACTIVE).count()
    total_batches = db.query(Batch).filter(Batch.beekeeper_id == user_id).count()
    total_production = db.query(func.sum(Batch.quantity_kg)).filter(Batch.beekeeper_id == user_id).scalar() or 0

    # Recent batches
    recent_batches = (
        db.query(Batch)
        .filter(Batch.beekeeper_id == user_id)
        .order_by(Batch.created_at.desc())
        .limit(5)
        .all()
    )

    # Variety distribution
    variety_data = (
        db.query(Batch.variety, func.count(Batch.id), func.sum(Batch.quantity_kg))
        .filter(Batch.beekeeper_id == user_id)
        .group_by(Batch.variety)
        .all()
    )

    return {
        "role": "beekeeper",
        "total_hives": total_hives,
        "active_hives": active_hives,
        "total_batches": total_batches,
        "total_production_kg": round(total_production, 2),
        "avg_production_per_hive": round(total_production / max(total_hives, 1), 2),
        "recent_batches": [
            {"id": b.id, "code": b.batch_code, "status": b.status.value, "quantity": b.quantity_kg}
            for b in recent_batches
        ],
        "variety_distribution": [
            {"variety": v.value if v else "unknown", "count": c, "total_kg": round(t or 0, 2)}
            for v, c, t in variety_data
        ],
    }


def _admin_stats(db: Session) -> dict:
    """Stats for admin dashboard."""
    total_users = db.query(User).count()
    total_hives = db.query(Hive).count()
    total_batches = db.query(Batch).count()
    total_events = db.query(SupplyChainEvent).count()
    total_blocks = db.query(Block).count()
    total_production = db.query(func.sum(Batch.quantity_kg)).scalar() or 0

    # Users by role
    users_by_role = (
        db.query(User.role, func.count(User.id))
        .group_by(User.role)
        .all()
    )

    # Batches by status
    batches_by_status = (
        db.query(Batch.status, func.count(Batch.id))
        .group_by(Batch.status)
        .all()
    )

    # Top beekeepers by production
    top_beekeepers = (
        db.query(User.name, func.sum(Batch.quantity_kg))
        .join(Batch, Batch.beekeeper_id == User.id)
        .group_by(User.id)
        .order_by(func.sum(Batch.quantity_kg).desc())
        .limit(5)
        .all()
    )

    return {
        "role": "admin",
        "total_users": total_users,
        "total_hives": total_hives,
        "total_batches": total_batches,
        "total_events": total_events,
        "total_blocks": total_blocks,
        "total_production_kg": round(total_production, 2),
        "users_by_role": [
            {"role": r.value if r else "unknown", "count": c}
            for r, c in users_by_role
        ],
        "batches_by_status": [
            {"status": s.value if s else "unknown", "count": c}
            for s, c in batches_by_status
        ],
        "top_beekeepers": [
            {"name": n, "production_kg": round(p or 0, 2)}
            for n, p in top_beekeepers
        ],
    }


def _supply_chain_stats(db: Session, user: User) -> dict:
    """Stats for supply chain actors (processor, distributor, retailer)."""
    # Batches this user has handled
    handled_batches = (
        db.query(SupplyChainEvent.batch_id)
        .filter(SupplyChainEvent.actor_id == user.id)
        .distinct()
        .count()
    )
    total_events = db.query(SupplyChainEvent).filter(SupplyChainEvent.actor_id == user.id).count()

    # Pending batches (currently held)
    pending_batches = db.query(Batch).filter(Batch.current_holder_id == user.id).count()

    return {
        "role": user.role.value,
        "batches_handled": handled_batches,
        "total_events": total_events,
        "pending_batches": pending_batches,
    }
