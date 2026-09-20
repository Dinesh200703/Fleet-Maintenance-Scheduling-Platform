from sqlalchemy.orm import Session
from app.core.security import hash_password,verify_password,create_access_token
from app.models.user import User
from app.schemas.user import UserCreate

class Solution:

 def create_user(self,db:Session,user:UserCreate):

  existing_user=db.query(User).filter(User.email==user.email).first()
  if existing_user:
   return None

  db_user=User(
   full_name=user.full_name,
   email=user.email,
   password=hash_password(user.password),
   role=user.role   # ✅ ALWAYS USE FRONTEND ROLE
  )

  db.add(db_user)
  db.commit()
  db.refresh(db_user)

  return db_user


 def login_user(self,db:Session,email:str,password:str):

  user=db.query(User).filter(User.email==email).first()

  if not user:
   return None

  if not verify_password(password,user.password):
   return None

  token=create_access_token({
   "user_id":user.id,
   "role":user.role   # ✅ INCLUDE ROLE IN TOKEN
  })

  return {
   "access_token":token,
   "token_type":"bearer",
   "role":user.role   # ✅ RETURN ROLE TO FRONTEND
  }