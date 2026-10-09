from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.maintenance import (
    CompletionSubmit,
    CompletionVerify,
    MaintenanceCreate,
    MaintenanceResponse,
    MaintenanceUpdate,
)
from app.services.auth_guard import require_roles
from app.services.maintenance_service import (
    create_maintenance,
    delete_maintenance,
    get_all_maintenance,
    get_driver_maintenance,
    get_maintenance_by_id,
    respond_to_assignment,
    start_work,
    submit_completion,
    update_maintenance,
    verify_completion,
)


router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


class AssignmentResponse(BaseModel):
    response: Literal["Accepted", "Declined"]


@router.get("/mine", response_model=list[MaintenanceResponse])
def my_assignments(db: Session = Depends(get_db), user: User = Depends(require_roles("driver"))):
    return get_driver_maintenance(db, user.id)


@router.post("/", response_model=MaintenanceResponse, status_code=201)
def add_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("manager", "admin")),
):
    return create_maintenance(db, maintenance)


@router.get("/", response_model=list[MaintenanceResponse])
def read_maintenance(
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("manager", "admin")),
):
    return get_all_maintenance(db)


@router.post("/{maintenance_id}/response", response_model=MaintenanceResponse)
def assignment_response(
    maintenance_id: int,
    body: AssignmentResponse,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("driver")),
):
    return respond_to_assignment(db, maintenance_id, user.id, body.response)


@router.post("/{maintenance_id}/complete", response_model=MaintenanceResponse)
def completion_submission(
    maintenance_id: int,
    body: CompletionSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("driver")),
):
    return submit_completion(db, maintenance_id, user.id, body.remarks)


@router.post("/{maintenance_id}/start", response_model=MaintenanceResponse)
def start_assignment(
    maintenance_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("driver")),
):
    return start_work(db, maintenance_id, user.id)


@router.post("/{maintenance_id}/verify", response_model=MaintenanceResponse)
def completion_verification(
    maintenance_id: int,
    body: CompletionVerify,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
):
    record = get_maintenance_by_id(db, maintenance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return verify_completion(db, record, admin.id, body)


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def read_maintenance_by_id(
    maintenance_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("manager", "admin")),
):
    record = get_maintenance_by_id(db, maintenance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def edit_maintenance(
    maintenance_id: int,
    maintenance: MaintenanceUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("manager", "admin")),
):
    record = update_maintenance(db, maintenance_id, maintenance)
    if record is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.delete("/{maintenance_id}")
def remove_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("admin", "manager")),
):
    if delete_maintenance(db, maintenance_id) is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return {"message": "Maintenance record deleted successfully"}
