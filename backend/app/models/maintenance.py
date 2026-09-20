from sqlalchemy import Column,Integer,String,Date,ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Maintenance(Base):
    __tablename__="maintenance"

    id=Column(Integer,primary_key=True,index=True)

    vehicle_id=Column(
        Integer,
        ForeignKey("vehicles.id",ondelete="CASCADE"),
        nullable=False
    )

    maintenance_type=Column(String(100),nullable=False)

    scheduled_date=Column(Date,nullable=False)

    status=Column(String(30),default="Scheduled")

    remarks=Column(String(255),nullable=True)

    # ✅ RELATIONSHIP
    vehicle=relationship("Vehicle",back_populates="maintenance_records")