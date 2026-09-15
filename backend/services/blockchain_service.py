import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.blockchain import Block


def get_clean_ts(timestamp) -> str:
    if hasattr(timestamp, "strftime"):
        return timestamp.strftime("%Y-%m-%d %H:%M:%S")
    s = str(timestamp)
    if "." in s:
        s = s.split(".")[0]
    if "+" in s:
        s = s.split("+")[0]
    return s.strip()


def calculate_hash(index: int, timestamp, data: str, previous_hash: str, nonce: int = 0) -> str:
    """Calculate SHA-256 hash for a block."""
    ts_clean = get_clean_ts(timestamp)
    block_string = f"{index}{ts_clean}{data}{previous_hash}{nonce}"
    return hashlib.sha256(block_string.encode()).hexdigest()


def create_genesis_block(db: Session, batch_id: int) -> Block:
    """Create the genesis (first) block for a batch's blockchain."""
    timestamp = datetime.now(timezone.utc)
    data = json.dumps({
        "event": "genesis",
        "batch_id": batch_id,
        "message": "Blockchain initialized for honey batch",
    })
    block_hash = calculate_hash(
        index=0,
        timestamp=timestamp,
        data=data,
        previous_hash="0" * 64,
        nonce=0,
    )

    genesis_block = Block(
        batch_id=batch_id,
        index=0,
        timestamp=timestamp,
        data=data,
        previous_hash="0" * 64,
        hash=block_hash,
        nonce=0,
    )
    db.add(genesis_block)
    db.commit()
    db.refresh(genesis_block)
    return genesis_block


def add_block(db: Session, batch_id: int, event_data: dict) -> Block:
    """Add a new block to the batch's blockchain."""
    # Get the last block in the chain
    last_block = (
        db.query(Block)
        .filter(Block.batch_id == batch_id)
        .order_by(Block.index.desc())
        .first()
    )

    if last_block is None:
        # No genesis block yet, create one first
        last_block = create_genesis_block(db, batch_id)

    new_index = last_block.index + 1
    timestamp = datetime.now(timezone.utc)
    data = json.dumps(event_data, default=str)

    # Simple proof-of-work: find nonce where hash starts with "00"
    nonce = 0
    while True:
        block_hash = calculate_hash(
            index=new_index,
            timestamp=timestamp,
            data=data,
            previous_hash=last_block.hash,
            nonce=nonce,
        )
        if block_hash.startswith("00"):
            break
        nonce += 1

    new_block = Block(
        batch_id=batch_id,
        index=new_index,
        timestamp=timestamp,
        data=data,
        previous_hash=last_block.hash,
        hash=block_hash,
        nonce=nonce,
    )
    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    return new_block


def verify_chain(db: Session, batch_id: int) -> dict:
    """Verify the integrity of a batch's blockchain."""
    blocks = (
        db.query(Block)
        .filter(Block.batch_id == batch_id)
        .order_by(Block.index.asc())
        .all()
    )

    if not blocks:
        return {"valid": False, "error": "No blocks found", "blocks_checked": 0}

    # Check genesis block
    genesis = blocks[0]
    if genesis.previous_hash != "0" * 64:
        return {"valid": False, "error": "Invalid genesis block", "blocks_checked": 1}

    expected_hash = calculate_hash(
        genesis.index, genesis.timestamp, genesis.data, genesis.previous_hash, genesis.nonce
    )
    if genesis.hash != expected_hash:
        return {"valid": False, "error": f"Genesis block hash mismatch at block #{genesis.index}", "blocks_checked": 1}

    # Check remaining blocks
    for i in range(1, len(blocks)):
        current = blocks[i]
        previous = blocks[i - 1]

        # Check link to previous block
        if current.previous_hash != previous.hash:
            return {
                "valid": False,
                "error": f"Chain broken at block #{current.index}: previous_hash mismatch",
                "blocks_checked": i + 1,
            }

        # Recalculate and verify hash
        expected_hash = calculate_hash(
            current.index, current.timestamp, current.data, current.previous_hash, current.nonce
        )
        if current.hash != expected_hash:
            return {
                "valid": False,
                "error": f"Hash mismatch at block #{current.index}",
                "blocks_checked": i + 1,
            }

    return {
        "valid": True,
        "blocks_checked": len(blocks),
        "chain_length": len(blocks),
        "first_block": blocks[0].hash[:16] + "...",
        "last_block": blocks[-1].hash[:16] + "...",
    }


def get_chain(db: Session, batch_id: int) -> list[dict]:
    """Get the full blockchain for a batch."""
    blocks = (
        db.query(Block)
        .filter(Block.batch_id == batch_id)
        .order_by(Block.index.asc())
        .all()
    )

    return [
        {
            "id": block.id,
            "index": block.index,
            "timestamp": str(block.timestamp),
            "data": json.loads(block.data),
            "previous_hash": block.previous_hash,
            "hash": block.hash,
            "nonce": block.nonce,
        }
        for block in blocks
    ]
