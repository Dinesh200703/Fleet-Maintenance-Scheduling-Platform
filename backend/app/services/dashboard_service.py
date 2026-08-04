from sqlalchemy.orm import Session

from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import Maintenance


def get_dashboard_summary(db: Session):
    total_users = db.query(User).count()
    total_vehicles = db.query(Vehicle).count()
    total_maintenance = db.query(Maintenance).count()

    scheduled = (
        db.query(Maintenance)
        .filter(Maintenance.status == "Scheduled")
        .count()
    )

    completed = (
        db.query(Maintenance)
        .filter(Maintenance.status == "Completed")
        .count()
    )

    return {
        "total_users": total_users,
        "total_vehicles": total_vehicles,
        "total_maintenance_records": total_maintenance,
        "scheduled_maintenance": scheduled,
        "completed_maintenance": completed,
    }