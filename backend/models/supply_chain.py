from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class EventType(str, enum.Enum):
    HARVESTED = "harvested"
    LAB_TESTED = "lab_tested"
    PROCESSED = "processed"
    PACKAGED = "packaged"
    DISPATCHED = "dispatched"
    RECEIVED = "received"
    QUALITY_CHECK = "quality_check"
    STORED = "stored"
    DISTRIBUTED = "distributed"
    RETAILED = "retailed"
    SOLD = "sold"


class SupplyChainEvent(Base):
    __tablename__ = "supply_chain_events"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(SAEnum(EventType), nullable=False)
    description = Column(Text, nullable=True)

    # Location data
    location = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Additional data (JSON string for flexibility)
    metadata_json = Column(Text, nullable=True)

    # Blockchain linkage
    block_hash = Column(String(64), nullable=True)

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    batch = relationship("Batch", back_populates="supply_chain_events")
    actor = relationship("User", back_populates="supply_chain_events")

    def __repr__(self):
        return f"<SupplyChainEvent {self.event_type.value} for Batch#{self.batch_id}>"
