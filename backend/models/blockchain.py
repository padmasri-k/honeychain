from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from database import Base


class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    index = Column(Integer, nullable=False)  # Position in the chain
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    data = Column(Text, nullable=False)  # JSON string of event data
    previous_hash = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False, index=True)
    nonce = Column(Integer, default=0)

    # Relationships
    batch = relationship("Batch", back_populates="blocks")

    def __repr__(self):
        return f"<Block #{self.index} hash={self.hash[:12]}... batch={self.batch_id}>"
