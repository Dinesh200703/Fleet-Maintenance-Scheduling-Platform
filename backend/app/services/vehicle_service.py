from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def create_vehicle(db: Session, vehicle: VehicleCreate):
    db_vehicle = Vehicle(
        vehicle_number=vehicle.vehicle_number,
        vehicle_type=vehicle.vehicle_type,
        manufacturer=vehicle.manufacturer,
        model=vehicle.model,
        manufacture_year=vehicle.manufacture_year,
        fuel_type=vehicle.fuel_type,
    )

    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle


def get_all_vehicles(db: Session):
    return db.query(Vehicle).all()


def get_vehicle_by_id(db: Session, vehicle_id: int):
    return (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )


def update_vehicle(db: Session, vehicle_id: int, vehicle_data: VehicleUpdate):
    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if vehicle is None:
        return None

    vehicle.vehicle_number = vehicle_data.vehicle_number
    vehicle.vehicle_type = vehicle_data.vehicle_type
    vehicle.manufacturer = vehicle_data.manufacturer
    vehicle.model = vehicle_data.model
    vehicle.manufacture_year = vehicle_data.manufacture_year
    vehicle.fuel_type = vehicle_data.fuel_type
    vehicle.status = vehicle_data.status
    vehicle.is_active = vehicle_data.is_active

    db.commit()
    db.refresh(vehicle)

    return vehicle


def delete_vehicle(db: Session, vehicle_id: int):
    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if vehicle is None:
        return None

    db.delete(vehicle)
    db.commit()

    return vehicle