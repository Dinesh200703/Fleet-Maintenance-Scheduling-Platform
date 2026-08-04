from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate


def create_maintenance(db: Session, maintenance: MaintenanceCreate):
    db_maintenance = Maintenance(
        vehicle_id=maintenance.vehicle_id,
        maintenance_type=maintenance.maintenance_type,
        scheduled_date=maintenance.scheduled_date,
        remarks=maintenance.remarks,
    )

    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)

    return db_maintenance


def get_all_maintenance(db: Session):
    return db.query(Maintenance).all()


def get_maintenance_by_id(db: Session, maintenance_id: int):
    return (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )


def update_maintenance(db: Session, maintenance_id: int, maintenance_data: MaintenanceUpdate):
    maintenance = (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )

    if maintenance is None:
        return None

    maintenance.maintenance_type = maintenance_data.maintenance_type
    maintenance.scheduled_date = maintenance_data.scheduled_date
    maintenance.status = maintenance_data.status
    maintenance.remarks = maintenance_data.remarks

    db.commit()
    db.refresh(maintenance)

    return maintenance


def delete_maintenance(db: Session, maintenance_id: int):
    maintenance = (
        db.query(Maintenance)
        .filter(Maintenance.id == maintenance_id)
        .first()
    )

    if maintenance is None:
        return None

    db.delete(maintenance)
    db.commit()

    return maintenance