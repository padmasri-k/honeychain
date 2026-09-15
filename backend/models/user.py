from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from database import Base


class UserRole(str, enum.Enum):
    BEEKEEPER = "beekeeper"
    PROCESSOR = "processor"
    DISTRIBUTOR = "distributor"
    RETAILER = "retailer"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.BEEKEEPER)
    organization = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    hives = relationship("Hive", back_populates="owner", lazy="dynamic")
    batches = relationship("Batch", back_populates="beekeeper", lazy="dynamic", foreign_keys="Batch.beekeeper_id")
    supply_chain_events = relationship("SupplyChainEvent", back_populates="actor", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.name} ({self.role.value})>"
