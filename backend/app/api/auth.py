from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate,UserLogin,UserResponse
from app.models.user import User
from datetime import datetime,timedelta
from jose import jwt
from passlib.context import CryptContext
import os

router=APIRouter(prefix="/auth",tags=["Authentication"])

SECRET_KEY=os.getenv("SECRET_KEY","secret")
ALGORITHM=os.getenv("ALGORITHM","HS256")

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

@router.post("/signup",response_model=UserResponse)
def signup(user:UserCreate,db:Session=Depends(get_db)):
    existing=db.query(User).filter(User.email==user.email).first()
    if existing:
        raise HTTPException(status_code=400,detail="Email already registered")

    hashed=pwd_context.hash(user.password)

    new_user=User(
        full_name=user.full_name,
        email=user.email,
        password=hashed,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(user:UserLogin,db:Session=Depends(get_db)):
    db_user=db.query(User).filter(User.email==user.email).first()

    if not db_user:
        raise HTTPException(status_code=401,detail="Invalid email or password")

    if not pwd_context.verify(user.password,db_user.password):
        raise HTTPException(status_code=401,detail="Invalid email or password")

    expire=datetime.utcnow()+timedelta(minutes=30)

    payload={
        "sub":str(db_user.id),
        "email":db_user.email,
        "role":db_user.role,
        "exp":expire
    }

    token=jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)

    return {
        "access_token":token,
        "token_type":"bearer",
        "role":db_user.role
    }