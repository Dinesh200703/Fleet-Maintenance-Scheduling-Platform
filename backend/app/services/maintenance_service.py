import json
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from app.models.maintenance import Maintenance
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.maintenance import CompletionVerify, MaintenanceCreate, MaintenanceUpdate

def create_maintenance(db: Session, data: MaintenanceCreate):
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id, Vehicle.is_active.is_(True)).first()
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Active vehicle not found")
    driver_id = data.assigned_driver_id if data.assigned_driver_id is not None else vehicle.driver_id
    driver = db.query(User).filter(User.id == driver_id, User.role == "driver", User.is_active.is_(True)).first() if driver_id is not None else None
    if driver is None:
        raise HTTPException(status_code=422, detail="An active driver is required")
    duplicate = db.query(Maintenance).filter(Maintenance.vehicle_id == data.vehicle_id, Maintenance.assigned_driver_id == driver_id, Maintenance.maintenance_type == data.maintenance_type, Maintenance.scheduled_date == data.scheduled_date).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="This maintenance assignment already exists")
    record = Maintenance(vehicle_id=data.vehicle_id, assigned_driver_id=driver_id, maintenance_type=data.maintenance_type,
                         scheduled_date=data.scheduled_date, remarks=data.remarks, status="Scheduled", assignment_response="Pending", verification_status="NotSubmitted")
    db.add(record); db.commit(); db.refresh(record)
    return record

def get_all_maintenance(db: Session):
    return db.query(Maintenance).options(joinedload(Maintenance.vehicle), joinedload(Maintenance.assigned_driver)).order_by(Maintenance.scheduled_date.desc()).all()

def get_driver_maintenance(db: Session, driver_id: int):
    return db.query(Maintenance).options(joinedload(Maintenance.vehicle)).filter(Maintenance.assigned_driver_id == driver_id).order_by(Maintenance.scheduled_date.desc()).all()

def get_maintenance_by_id(db: Session, maintenance_id: int):
    return db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()

def respond_to_assignment(db: Session, maintenance_id: int, driver_id: int, response: str):
    record = db.query(Maintenance).filter(Maintenance.id == maintenance_id, Maintenance.assigned_driver_id == driver_id).with_for_update().first()
    if record is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if record.assignment_response != "Pending" or record.status != "Scheduled":
        raise HTTPException(status_code=409, detail="Assignment has already been answered or started")
    record.assignment_response = response
    record.response_at = datetime.now(timezone.utc)
    db.commit(); db.refresh(record)
    return record

def start_work(db: Session, maintenance_id: int, driver_id: int):
    record = db.query(Maintenance).filter(Maintenance.id == maintenance_id, Maintenance.assigned_driver_id == driver_id).with_for_update().first()
    if record is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if record.assignment_response != "Accepted" or record.status != "Scheduled":
        raise HTTPException(status_code=409, detail="Only an accepted scheduled assignment can be started")
    record.status = "InProgress"
    db.commit(); db.refresh(record)
    return record

def submit_completion(db: Session, maintenance_id: int, driver_id: int, remarks: str):
    record = db.query(Maintenance).filter(Maintenance.id == maintenance_id, Maintenance.assigned_driver_id == driver_id).with_for_update().first()
    if record is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if record.assignment_response != "Accepted" or record.status not in ("InProgress", "NeedsRework"):
        raise HTTPException(status_code=409, detail="Only accepted work can be submitted for completion")
    record.completion_remarks = remarks
    record.completion_submitted_at = datetime.now(timezone.utc)
    record.verification_status = "Pending"
    record.status = "CompletionSubmitted"
    db.commit(); db.refresh(record)
    return record

def verify_completion(db: Session, record: Maintenance, admin_id: int, decision: CompletionVerify):
    if record.status != "CompletionSubmitted" or record.verification_status != "Pending":
        raise HTTPException(status_code=409, detail="No pending completion is available for review")
    history = json.loads(record.verification_history or "[]")
    history.append({"decision": decision.decision, "remarks": decision.remarks, "admin_id": admin_id, "verified_at": datetime.now(timezone.utc).isoformat(), "completion_remarks": record.completion_remarks, "completion_submitted_at": record.completion_submitted_at.isoformat() if record.completion_submitted_at else None})
    record.verification_history = json.dumps(history)
    record.verification_status = decision.decision
    record.verification_remarks = decision.remarks
    record.verified_by = admin_id
    record.verified_at = datetime.now(timezone.utc)
    record.status = "Completed" if decision.decision == "Verified" else "NeedsRework"
    db.commit(); db.refresh(record)
    return record

def update_maintenance(db: Session, maintenance_id: int, data: MaintenanceUpdate):
    record = get_maintenance_by_id(db, maintenance_id)
    if record is None:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit(); db.refresh(record)
    return record

def delete_maintenance(db: Session, maintenance_id: int):
    record = get_maintenance_by_id(db, maintenance_id)
    if record is None:
        return None
    if record.status == "Completed" or record.verification_history or record.completion_submitted_at:
        raise HTTPException(status_code=409, detail="Maintenance with completion history cannot be deleted")
    db.delete(record); db.commit()
    return record
