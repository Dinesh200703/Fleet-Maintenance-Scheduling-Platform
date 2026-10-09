from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_guard import require_roles


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=201)
def provision_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        full_name=data.full_name,
        email=data.email,
        password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/drivers", response_model=list[UserResponse])
def list_drivers(db: Session = Depends(get_db), _user: User = Depends(require_roles("manager", "admin"))):
    return db.query(User).filter(User.role == "driver", User.is_active.is_(True)).order_by(User.id).all()


@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_roles("admin"))):
    return db.query(User).order_by(User.id).all()


@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=409, detail="You cannot deactivate your own account")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}
