from sqlalchemy import Boolean,Column,Integer,String,ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Vehicle(Base):
 __tablename__="vehicles"

 id=Column(Integer,primary_key=True,index=True)

 vehicle_number=Column(String(20),unique=True,nullable=False)
 vehicle_type=Column(String(50),nullable=False)
 manufacturer=Column(String(100),nullable=False)
 model=Column(String(100),nullable=False)
 manufacture_year=Column(Integer)
 fuel_type=Column(String(20))
 status=Column(String(20),default="Available")
 is_active=Column(Boolean,default=True)

 driver_id=Column(Integer,ForeignKey("users.id"),nullable=True)

 driver=relationship("User",back_populates="vehicles")

 maintenance_records=relationship("Maintenance",back_populates="vehicle")