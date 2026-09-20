from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.vehicle import VehicleCreate,VehicleUpdate,VehicleResponse
from app.services.vehicle_service import create_vehicle,get_all_vehicles,get_vehicle_by_id,update_vehicle,delete_vehicle
from app.services.auth_guard import verify_token

router=APIRouter(prefix="/vehicles",tags=["Vehicles"])

class Solution:

 def add_vehicle(self,vehicle:VehicleCreate,db:Session,user=Depends(verify_token)):
  return create_vehicle(db,vehicle)

 def read_vehicles(self,db:Session,user=Depends(verify_token)):
  return get_all_vehicles(db)

 def read_vehicle(self,vehicle_id:int,db:Session,user=Depends(verify_token)):
  vehicle=get_vehicle_by_id(db,vehicle_id)
  if not vehicle:
   raise HTTPException(status_code=404,detail="Vehicle not found")
  return vehicle

 def edit_vehicle(self,vehicle_id:int,vehicle:VehicleUpdate,db:Session,user=Depends(verify_token)):
  updated=update_vehicle(db,vehicle_id,vehicle)
  if not updated:
   raise HTTPException(status_code=404,detail="Vehicle not found")
  return updated

 def remove_vehicle(self,vehicle_id:int,db:Session,user=Depends(verify_token)):
  deleted=delete_vehicle(db,vehicle_id)
  if not deleted:
   raise HTTPException(status_code=404,detail="Vehicle not found")
  return {"message":"Vehicle deleted successfully"}


solution=Solution()

@router.post("/",response_model=VehicleResponse)
def add_vehicle(vehicle:VehicleCreate,db:Session=Depends(get_db),user=Depends(verify_token)):
 return solution.add_vehicle(vehicle,db,user)

@router.get("/",response_model=list[VehicleResponse])
def read_vehicles(db:Session=Depends(get_db),user=Depends(verify_token)):
 return solution.read_vehicles(db,user)

@router.get("/{vehicle_id}",response_model=VehicleResponse)
def read_vehicle(vehicle_id:int,db:Session=Depends(get_db),user=Depends(verify_token)):
 return solution.read_vehicle(vehicle_id,db,user)

@router.put("/{vehicle_id}",response_model=VehicleResponse)
def edit_vehicle(vehicle_id:int,vehicle:VehicleUpdate,db:Session=Depends(get_db),user=Depends(verify_token)):
 return solution.edit_vehicle(vehicle_id,vehicle,db,user)

@router.delete("/{vehicle_id}")
def remove_vehicle(vehicle_id:int,db:Session=Depends(get_db),user=Depends(verify_token)):
 return solution.remove_vehicle(vehicle_id,db,user)