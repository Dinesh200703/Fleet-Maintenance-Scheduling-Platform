from sqlalchemy import String, cast, func
from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance
from app.models.user import User
from app.models.vehicle import Vehicle


def _count(db: Session, *criteria):
    query = db.query(func.count(Maintenance.id))
    if criteria:
        query = query.filter(*criteria)
    return query.scalar() or 0


def get_driver_summary(db: Session, driver_id: int):
    total = _count(db, Maintenance.assigned_driver_id == driver_id)
    accepted = _count(db, Maintenance.assigned_driver_id == driver_id, Maintenance.assignment_response == "Accepted")
    declined = _count(db, Maintenance.assigned_driver_id == driver_id, Maintenance.assignment_response == "Declined")
    completed = _count(db, Maintenance.assigned_driver_id == driver_id, Maintenance.status == "Completed")
    pending = _count(db, Maintenance.assigned_driver_id == driver_id, Maintenance.assignment_response == "Pending")
    activity = db.query(Maintenance.scheduled_date, func.count(Maintenance.id)).filter(
        Maintenance.assigned_driver_id == driver_id
    ).group_by(Maintenance.scheduled_date).order_by(Maintenance.scheduled_date).all()
    return {
        "profile": {"id": (user := db.query(User).filter(User.id == driver_id).first()).id, "full_name": user.full_name, "email": user.email},
        "total_assigned": total,
        "accepted": accepted,
        "declined": declined,
        "completed": completed,
        "pending": pending,
        "completion_rate": round(completed / total * 100, 1) if total else 0,
        "activity": [{"date": str(day), "count": count} for day, count in activity],
    }


def get_dashboard_summary(db: Session):
    total_drivers = db.query(User).filter(User.role == "driver").count()
    total_managers = db.query(User).filter(User.role == "manager").count()
    total_users = db.query(User).count()
    total_vehicles = db.query(Vehicle).count()
    total_maintenance = db.query(Maintenance).count()
    completed = _count(db, Maintenance.status == "Completed")
    scheduled = _count(db, Maintenance.status == "Scheduled")
    in_progress = _count(db, Maintenance.status == "InProgress")
    submitted = _count(db, Maintenance.status == "CompletionSubmitted")
    declined = _count(db, Maintenance.assignment_response == "Declined")
    overdue = _count(
        db,
        Maintenance.scheduled_date < func.current_date(),
        Maintenance.status.in_(["Scheduled", "InProgress", "NeedsRework"]),
        Maintenance.assignment_response != "Declined",
    )
    status_counts = db.query(Maintenance.status, func.count(Maintenance.id)).group_by(Maintenance.status).all()
    month = func.substr(cast(Maintenance.scheduled_date, String), 1, 7)
    monthly = db.query(month, func.count(Maintenance.id)).group_by(month).order_by(month).all()
    return {
        "total_users": total_users,
        "total_drivers": total_drivers,
        "active_drivers": db.query(User).filter(User.role == "driver", User.is_active.is_(True)).count(),
        "total_managers": total_managers,
        "total_vehicles": total_vehicles,
        "active_vehicles": db.query(Vehicle).filter(Vehicle.is_active.is_(True)).count(),
        "total_maintenance_records": total_maintenance,
        "scheduled_maintenance": scheduled,
        "pending_maintenance": _count(db, Maintenance.assignment_response == "Pending"),
        "in_progress_maintenance": in_progress,
        "completion_submissions": submitted,
        "completed_maintenance": completed,
        "declined_assignments": declined,
        "overdue_maintenance": overdue,
        "status_distribution": [{"status": name, "count": count} for name, count in status_counts],
        "activity": [{"month": str(month), "count": count} for month, count in monthly],
    }
