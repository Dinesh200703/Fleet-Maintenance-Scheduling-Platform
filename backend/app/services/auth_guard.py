from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from jose import jwt,JWTError
import os

security=HTTPBearer()

SECRET_KEY=os.getenv("SECRET_KEY","secret")
ALGORITHM=os.getenv("ALGORITHM","HS256")

class Solution:

 def verify_token(self,credentials:HTTPAuthorizationCredentials=Depends(security)):
  token=credentials.credentials
  try:
   payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
   if "sub" not in payload or "role" not in payload:
    raise HTTPException(status_code=401,detail="Invalid token payload")
   return payload
  except JWTError:
   raise HTTPException(status_code=401,detail="Invalid or expired token")

solution=Solution()

def verify_token(credentials:HTTPAuthorizationCredentials=Depends(security)):
 return solution.verify_token(credentials)