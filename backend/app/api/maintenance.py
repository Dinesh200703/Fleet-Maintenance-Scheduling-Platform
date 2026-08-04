from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
)
from app.services.maintenance_service import (
    create_maintenance,
    get_all_maintenance,
    get_maintenance_by_id,
    update_maintenance,
    delete_maintenance,
)

router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"]
)


@router.post("/", response_model=MaintenanceResponse)
def add_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db)
):
    return create_maintenance(db, maintenance)


@router.get("/", response_model=list[MaintenanceResponse])
def read_maintenance(
    db: Session = Depends(get_db)
):
    return get_all_maintenance(db)


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def read_maintenance_by_id(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    maintenance = get_maintenance_by_id(db, maintenance_id)

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    return maintenance


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def edit_maintenance(
    maintenance_id: int,
    maintenance: MaintenanceUpdate,
    db: Session = Depends(get_db)
):
    updated_maintenance = update_maintenance(
        db,
        maintenance_id,
        maintenance
    )

    if updated_maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    return updated_maintenance


@router.delete("/{maintenance_id}")
def remove_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    deleted_maintenance = delete_maintenance(
        db,
        maintenance_id
    )

    if deleted_maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found"
        )

    return {
        "message": "Maintenance record deleted successfully"
    }