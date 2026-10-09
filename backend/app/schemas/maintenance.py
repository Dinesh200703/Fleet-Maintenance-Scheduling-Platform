from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    maintenance_type: str = Field(min_length=1, max_length=100)
    scheduled_date: date
    remarks: str | None = Field(default=None, max_length=255)
    assigned_driver_id: int | None = None


class MaintenanceUpdate(BaseModel):
    maintenance_type: str | None = Field(default=None, min_length=1, max_length=100)
    scheduled_date: date | None = None
    remarks: str | None = Field(default=None, max_length=255)


class MaintenanceVehicle(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_number: str
    vehicle_type: str
    manufacturer: str
    model: str


class MaintenanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    assigned_driver_id: int | None
    maintenance_type: str
    scheduled_date: date
    status: str
    remarks: str | None
    assignment_response: str
    response_at: datetime | None
    completion_remarks: str | None
    completion_submitted_at: datetime | None
    verification_status: str
    verification_remarks: str | None
    verification_history: str | None
    verified_by: int | None
    verified_at: datetime | None
    vehicle: MaintenanceVehicle | None = None


class CompletionSubmit(BaseModel):
    remarks: str = Field(min_length=1, max_length=500)


class CompletionVerify(BaseModel):
    decision: Literal["Verified", "Rejected"]
    remarks: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def rejected_completion_needs_reason(self):
        if self.decision == "Rejected" and not (self.remarks or "").strip():
            raise ValueError("A rejection reason is required")
        return self
