from datetime import date
from pydantic import BaseModel


class MaintenanceBase(BaseModel):
    vehicle_id: int
    maintenance_type: str
    scheduled_date: date
    remarks: str | None = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    maintenance_type: str
    scheduled_date: date
    status: str
    remarks: str | None = None


class MaintenanceResponse(MaintenanceBase):
    id: int
    status: str

    class Config:
        from_attributes = True