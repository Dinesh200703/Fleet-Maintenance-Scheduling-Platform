from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def create_vehicle(db: Session, data: VehicleCreate):
    vehicle = Vehicle(**data.model_dump(), status="Available")
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def get_all_vehicles(db: Session):
    return db.query(Vehicle).all()


def get_vehicles_by_driver(db: Session, driver_id: int):
    return db.query(Vehicle).filter(Vehicle.driver_id == driver_id, Vehicle.is_active.is_(True)).all()


def get_vehicle_by_id(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()


def _eligible_driver(db: Session, driver_id: int):
    driver = db.query(User).filter(User.id == driver_id).first()
    if driver is None or driver.role != "driver" or not driver.is_active:
        raise HTTPException(status_code=422, detail="An active driver is required")
    return driver


def update_vehicle(db: Session, vehicle_id: int, data: VehicleUpdate):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if vehicle is None:
        return None
    changes = data.model_dump(exclude_unset=True)
    if "driver_id" in changes and changes["driver_id"] is not None:
        _eligible_driver(db, changes["driver_id"])
        if vehicle.driver_id not in (None, changes["driver_id"]):
            raise HTTPException(status_code=409, detail="Vehicle is already assigned to another driver")
        other_vehicle = db.query(Vehicle).filter(
            Vehicle.driver_id == changes["driver_id"], Vehicle.id != vehicle.id, Vehicle.is_active.is_(True)
        ).first()
        if other_vehicle:
            raise HTTPException(status_code=409, detail="Driver is already assigned to another vehicle")
        changes["status"] = "Assigned"
    elif changes.get("driver_id") is None and "driver_id" in changes:
        changes["status"] = "Available"
    for field, value in changes.items():
        setattr(vehicle, field, value)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(vehicle)
    return vehicle


def delete_vehicle(db: Session, vehicle_id: int):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if vehicle is None:
        return None
    vehicle.is_active = False
    vehicle.status = "Inactive"
    vehicle.driver_id = None
    db.commit()
    return vehicle
