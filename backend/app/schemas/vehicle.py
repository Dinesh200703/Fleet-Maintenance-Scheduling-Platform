from pydantic import BaseModel


class VehicleBase(BaseModel):
    vehicle_number: str
    vehicle_type: str
    manufacturer: str
    model: str
    manufacture_year: int
    fuel_type: str


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(VehicleBase):
    status: str
    is_active: bool


class VehicleResponse(VehicleBase):
    id: int
    status: str
    is_active: bool

    class Config:
        from_attributes = True