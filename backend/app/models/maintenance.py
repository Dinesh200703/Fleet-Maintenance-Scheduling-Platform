from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Maintenance(Base):
    __tablename__ = "maintenance"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    assigned_driver_id = Column(Integer, ForeignKey("users.id", name="fk_maintenance_assigned_driver"), nullable=True, index=True)
    maintenance_type = Column(String(100), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    status = Column(String(30), default="Scheduled", nullable=False)
    remarks = Column(String(255), nullable=True)
    assignment_response = Column(String(20), default="Pending", nullable=False)
    response_at = Column(DateTime, nullable=True)
    completion_remarks = Column(String(500), nullable=True)
    completion_submitted_at = Column(DateTime, nullable=True)
    verification_status = Column(String(20), default="NotSubmitted", nullable=False)
    verification_remarks = Column(String(500), nullable=True)
    verification_history = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id", name="fk_maintenance_verified_by"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    vehicle = relationship("Vehicle", back_populates="maintenance_records")
    assigned_driver = relationship("User", back_populates="assigned_maintenance", foreign_keys=[assigned_driver_id])
    verifier = relationship("User", foreign_keys=[verified_by])
