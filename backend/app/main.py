from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.vehicle import router as vehicle_router
from app.api.maintenance import router as maintenance_router

from app.database import Base, engine

from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import Maintenance

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fleet Maintenance Scheduling Platform API",
    version="1.0.0",
    description="Backend API for Fleet Maintenance Scheduling Platform"
)

# Register API routes
app.include_router(auth_router)
app.include_router(vehicle_router)
app.include_router(maintenance_router)


@app.get("/")
def root():
    return {
        "message": "Fleet Maintenance Scheduling Platform API is running successfully!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }