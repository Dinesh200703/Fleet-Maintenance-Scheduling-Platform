from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleAssignment, VehicleCreate, VehicleResponse, VehicleUpdate
from app.services.auth_guard import get_current_user, require_roles
from app.services.vehicle_service import (
    create_vehicle,
    delete_vehicle,
    get_all_vehicles,
    get_vehicle_by_id,
    get_vehicles_by_driver,
    update_vehicle,
)


router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("/", response_model=list[VehicleResponse])
def read_vehicles(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == "driver":
        return get_vehicles_by_driver(db, user.id)
    return get_all_vehicles(db)


@router.post("/", response_model=VehicleResponse, status_code=201)
def add_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("admin", "manager")),
):
    return create_vehicle(db, vehicle)


@router.patch("/{vehicle_id}/assignment", response_model=VehicleResponse)
def assign_vehicle(vehicle_id: int, body: VehicleAssignment, db: Session = Depends(get_db), _manager: User = Depends(require_roles("manager", "admin"))):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    driver = db.query(User).filter(User.id == body.driver_id, User.role == "driver", User.is_active.is_(True)).first()
    if driver is None:
        raise HTTPException(status_code=422, detail="An active driver is required")
    if not vehicle.is_active or vehicle.status not in ("Available", "Assigned"):
        raise HTTPException(status_code=409, detail="Vehicle is unavailable")
    if vehicle.driver_id is not None and vehicle.driver_id != driver.id:
        raise HTTPException(status_code=409, detail="Vehicle is already assigned to another driver")
    other_vehicle = db.query(Vehicle).filter(
        Vehicle.driver_id == driver.id, Vehicle.id != vehicle.id, Vehicle.is_active.is_(True)
    ).first()
    if other_vehicle:
        raise HTTPException(status_code=409, detail="Driver is already assigned to another vehicle")
    vehicle.driver_id = driver.id
    vehicle.status = "Assigned"
    db.commit(); db.refresh(vehicle)
    return vehicle
@router.get("/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if vehicle is None or (user.role == "driver" and vehicle.driver_id != user.id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def edit_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("admin", "manager")),
):
    updated = update_vehicle(db, vehicle_id, vehicle)
    if updated is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return updated


@router.delete("/{vehicle_id}")
def remove_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("admin", "manager")),
):
    deleted = delete_vehicle(db, vehicle_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted successfully"}
