from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class BatchStatus(str, enum.Enum):
    HARVESTED = "harvested"
    TESTING = "testing"
    PROCESSING = "processing"
    PACKAGED = "packaged"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    SOLD = "sold"


class HoneyVariety(str, enum.Enum):
    MULTIFLORA = "multiflora"
    MUSTARD = "mustard"
    LITCHI = "litchi"
    SIDR = "sidr"
    EUCALYPTUS = "eucalyptus"
    ACACIA = "acacia"
    SUNFLOWER = "sunflower"
    MANGROVE = "mangrove"
    WILD = "wild"
    OTHER = "other"


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(50), unique=True, nullable=False, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id"), nullable=False)
    beekeeper_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Honey details
    variety = Column(SAEnum(HoneyVariety), default=HoneyVariety.MULTIFLORA)
    harvest_date = Column(DateTime, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    moisture_pct = Column(Float, nullable=True)
    color_grade = Column(String(50), nullable=True)  # e.g., "Light Amber", "Dark Amber"
    hmf_level = Column(Float, nullable=True)  # Hydroxymethylfurfural mg/kg
    purity_score = Column(Float, nullable=True)  # 0-100

    # Status
    status = Column(SAEnum(BatchStatus), default=BatchStatus.HARVESTED)
    qr_code_path = Column(String(500), nullable=True)
    current_holder_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    hive = relationship("Hive", back_populates="batches")
    beekeeper = relationship("User", back_populates="batches", foreign_keys=[beekeeper_id])
    current_holder = relationship("User", foreign_keys=[current_holder_id])
    supply_chain_events = relationship("SupplyChainEvent", back_populates="batch", order_by="SupplyChainEvent.timestamp")
    blocks = relationship("Block", back_populates="batch", order_by="Block.index")

    def __repr__(self):
        return f"<Batch {self.batch_code} ({self.status.value})>"
