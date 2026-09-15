from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.batch import Batch
from services.qr_service import generate_qr_code
from services.auth_service import get_current_user
from models.user import User

router = APIRouter(prefix="/api/qr", tags=["QR Codes"])


@router.get("/{batch_code}")
def get_qr_code(batch_code: str, db: Session = Depends(get_db)):
    """Generate or retrieve QR code for a batch (public endpoint)."""
    batch = db.query(Batch).filter(Batch.batch_code == batch_code).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    qr_result = generate_qr_code(batch_code)
    return {
        "batch_code": batch_code,
        "qr_image": qr_result["base64"],
        "verify_url": f"http://localhost:5173/verify/{batch_code}",
    }


@router.post("/generate/{batch_id}")
def generate_batch_qr(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a QR code for a specific batch."""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    qr_result = generate_qr_code(batch.batch_code)
    batch.qr_code_path = qr_result["filename"]
    db.commit()

    return {
        "batch_id": batch_id,
        "batch_code": batch.batch_code,
        "qr_image": qr_result["base64"],
        "filename": qr_result["filename"],
    }
