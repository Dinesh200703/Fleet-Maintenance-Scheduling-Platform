from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
)
from app.services.vehicle_service import (
    create_vehicle,
    get_all_vehicles,
    get_vehicle_by_id,
    update_vehicle,
    delete_vehicle,
)

# 🔐 Import token verification
from app.services.auth_guard import verify_token


router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)

# ✅ CREATE VEHICLE (Protected)
@router.post("/", response_model=VehicleResponse)
def add_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    user: str = Depends(verify_token)   # 🔐 Protected
):
    return create_vehicle(db, vehicle)


# ✅ GET ALL VEHICLES (Protected)
@router.get("/", response_model=list[VehicleResponse])
def read_vehicles(
    db: Session = Depends(get_db),
    user: str = Depends(verify_token)   # 🔐 Protected
):
    return get_all_vehicles(db)


# ✅ GET VEHICLE BY ID (Protected)
@router.get("/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(verify_token)   # 🔐 Protected
):
    vehicle = get_vehicle_by_id(db, vehicle_id)

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return vehicle


# ✅ UPDATE VEHICLE (Protected)
@router.put("/{vehicle_id}", response_model=VehicleResponse)
def edit_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db),
    user: str = Depends(verify_token)   # 🔐 Protected
):
    updated_vehicle = update_vehicle(db, vehicle_id, vehicle)

    if updated_vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return updated_vehicle


# ✅ DELETE VEHICLE (Protected)
@router.delete("/{vehicle_id}")
def remove_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: str = Depends(verify_token)   # 🔐 Protected
):
    deleted_vehicle = delete_vehicle(db, vehicle_id)

    if deleted_vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return {
        "message": "Vehicle deleted successfully"
    }