from pydantic import BaseModel,EmailStr
from typing import Literal,Optional

class UserBase(BaseModel):
 full_name:str
 email:EmailStr

class UserCreate(UserBase):
 password:str
 role:Literal["admin","manager","driver"]="driver"

class UserLogin(BaseModel):
 email:EmailStr
 password:str

class UserResponse(UserBase):
 id:int
 role:Literal["admin","manager","driver"]
 is_active:bool

 class Config:
  from_attributes=True

class UserWithVehicles(UserResponse):
 vehicles:Optional[list]=[]