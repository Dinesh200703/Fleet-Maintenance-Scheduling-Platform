from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class VehicleBase(BaseModel):
    vehicle_number: str = Field(min_length=1, max_length=20)
    vehicle_type: str = Field(min_length=1, max_length=50)
    manufacturer: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    manufacture_year: Optional[int] = None
    fuel_type: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    manufacture_year: Optional[int] = None
    fuel_type: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class VehicleResponse(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    is_active: bool
    driver_id: Optional[int] = None

class VehicleAssignment(BaseModel):
    driver_id: int = Field(gt=0)
