from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import ensure_schema
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.maintenance import Maintenance
from app.api.auth import router as auth_router
from app.api.vehicle import router as vehicle_router
from app.api.maintenance import router as maintenance_router
from app.api.dashboard import router as dashboard_router
from app.api.users import router as users_router

app = FastAPI(title="Fleet Maintenance Scheduling Platform API", version="1.0.0")
ensure_schema()


@app.middleware("http")
async def strip_vercel_api_prefix(request, call_next):
    path = request.scope["path"]
    if path == "/api" or path.startswith("/api/"):
        request.scope["path"] = path[4:] or "/"
        request.scope["raw_path"] = request.scope["path"].encode("utf-8")
    return await call_next(request)


app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(vehicle_router)
app.include_router(maintenance_router)
app.include_router(dashboard_router)
app.include_router(users_router)

@app.get("/")
def root():
    return {"message": "Fleet Maintenance Scheduling Platform API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
