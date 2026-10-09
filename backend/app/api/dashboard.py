from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance import Maintenance
from app.models.user import User
from app.models.vehicle import Vehicle
from app.services.auth_guard import require_roles
from app.services.dashboard_service import get_dashboard_summary, get_driver_summary


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), _user: User = Depends(require_roles("admin", "manager"))):
    return get_dashboard_summary(db)


@router.get("/driver")
def driver_dashboard(db: Session = Depends(get_db), driver: User = Depends(require_roles("driver"))):
    return get_driver_summary(db, driver.id)


@router.get("/manager")
def manager_dashboard(db: Session = Depends(get_db), _manager: User = Depends(require_roles("manager", "admin"))):
    drivers = db.query(User).filter(User.role == "driver").order_by(User.id).all()
    result = []
    for driver in drivers:
        assigned_vehicle = db.query(Vehicle).filter(Vehicle.driver_id == driver.id).first()
        pending = db.query(Maintenance).filter(Maintenance.assigned_driver_id == driver.id, Maintenance.assignment_response == "Pending").count()
        accepted = db.query(Maintenance).filter(Maintenance.assigned_driver_id == driver.id, Maintenance.assignment_response == "Accepted").count()
        declined = db.query(Maintenance).filter(Maintenance.assigned_driver_id == driver.id, Maintenance.assignment_response == "Declined").count()
        completed = db.query(Maintenance).filter(Maintenance.assigned_driver_id == driver.id, Maintenance.status == "Completed").count()
        assigned_vehicles = db.query(Vehicle).filter(Vehicle.driver_id == driver.id).all()
        result.append({
            "id": driver.id, "full_name": driver.full_name, "email": driver.email,
            "is_active": driver.is_active, "vehicle_ids": [vehicle.vehicle_number for vehicle in assigned_vehicles],
            "vehicle_id": assigned_vehicle.id if assigned_vehicle else None,
            "vehicle_number": assigned_vehicle.vehicle_number if assigned_vehicle else None,
            "assignment_count": pending + accepted + declined, "assignments": pending + accepted + declined,
            "pending": pending, "accepted": accepted, "declined": declined, "completed": completed,
        })
    attention = db.query(Maintenance).filter(Maintenance.status.in_(["CompletionSubmitted", "NeedsRework"])).count()
    status_distribution = dict(db.query(Maintenance.status, func.count(Maintenance.id)).group_by(Maintenance.status).all())
    return {
        "drivers": result,
        "drivers_total": len(drivers), "drivers_active": sum(d.is_active for d in drivers),
        "total_drivers": len(drivers), "active_drivers": sum(d.is_active for d in drivers),
        "attention_required": attention, "tasks_requiring_attention": attention,
        "status_distribution": status_distribution,
    }
