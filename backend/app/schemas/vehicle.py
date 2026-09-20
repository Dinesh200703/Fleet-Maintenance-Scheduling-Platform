from pydantic import BaseModel
from typing import Optional

class VehicleBase(BaseModel):
 vehicle_number:str
 vehicle_type:str
 manufacturer:str
 model:str
 manufacture_year:int
 fuel_type:str

class VehicleCreate(VehicleBase):
 driver_id:Optional[int]=None

class VehicleUpdate(BaseModel):
 vehicle_number:Optional[str]=None
 vehicle_type:Optional[str]=None
 manufacturer:Optional[str]=None
 model:Optional[str]=None
 manufacture_year:Optional[int]=None
 fuel_type:Optional[str]=None
 status:Optional[str]=None
 is_active:Optional[bool]=None
 driver_id:Optional[int]=None

class VehicleResponse(VehicleBase):
 id:int
 status:str
 is_active:bool
 driver_id:Optional[int]=None

 class Config:
  from_attributes=True