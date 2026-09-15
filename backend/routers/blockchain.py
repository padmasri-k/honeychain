from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from services.blockchain_service import verify_chain, get_chain

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain"])


@router.get("/chain/{batch_id}")
def get_batch_chain(batch_id: int, db: Session = Depends(get_db)):
    """Get the full blockchain for a batch (public endpoint)."""
    chain = get_chain(db, batch_id)
    if not chain:
        raise HTTPException(status_code=404, detail="No blockchain found for this batch")
    return {"batch_id": batch_id, "chain_length": len(chain), "blocks": chain}


@router.get("/verify/{batch_id}")
def verify_batch_chain(batch_id: int, db: Session = Depends(get_db)):
    """Verify the blockchain integrity for a batch (public endpoint)."""
    result = verify_chain(db, batch_id)
    return {
        "batch_id": batch_id,
        **result,
    }
