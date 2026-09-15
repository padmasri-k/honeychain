from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class HiveStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISEASED = "diseased"
    HARVESTING = "harvesting"
    DORMANT = "dormant"


class Hive(Base):
    __tablename__ = "hives"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    location_name = Column(String(200), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    bee_species = Column(String(100), nullable=True)
    flora_source = Column(String(200), nullable=True)
    hive_type = Column(String(50), default="Langstroth")
    colony_strength = Column(Integer, nullable=True)  # estimated bee count
    status = Column(SAEnum(HiveStatus), default=HiveStatus.ACTIVE)
    notes = Column(Text, nullable=True)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_inspection = Column(DateTime, nullable=True)

    # Relationships
    owner = relationship("User", back_populates="hives")
    batches = relationship("Batch", back_populates="hive", lazy="dynamic")

    def __repr__(self):
        return f"<Hive {self.name} ({self.status.value})>"
