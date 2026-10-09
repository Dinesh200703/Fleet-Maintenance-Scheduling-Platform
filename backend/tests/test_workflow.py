import asyncio
import json
from urllib.parse import urlsplit
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import database as database_module
from app.core.security import hash_password, verify_password
from app.database import Base, ensure_schema as run_schema_migration, get_db
from app.models.maintenance import Maintenance
from app.models.user import User
from app.models.vehicle import Vehicle

# Import the real application and its middleware without executing the live
# startup migration. All request database access is overridden to SQLite below.
database_module.ensure_schema = lambda *_args, **_kwargs: None
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)

def override_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()
app.dependency_overrides[get_db] = override_db
class ASGIClient:
    """Small in-process client so these isolated tests do not need network or MySQL."""
    def request(self, method, url, headers=None, json_body=None):
        parts = urlsplit(url)
        body = json.dumps(json_body).encode() if json_body is not None else b""
        sent = False
        events = []
        async def receive():
            nonlocal sent
            if sent:
                return {"type": "http.disconnect"}
            sent = True
            return {"type": "http.request", "body": body, "more_body": False}
        async def send(event):
            events.append(event)
        scope = {
            "type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
            "method": method, "scheme": "http", "path": parts.path,
            "raw_path": parts.path.encode(), "query_string": parts.query.encode(),
            "root_path": "", "headers": [(k.lower().encode(), v.encode()) for k, v in ({**({"content-type": "application/json"} if json_body is not None else {}), **(headers or {})}).items()],
            "client": ("testclient", 50000), "server": ("testserver", 80),
        }
        asyncio.run(app(scope, receive, send))
        status = events[0]["status"]
        content = b"".join(event.get("body", b"") for event in events if event["type"] == "http.response.body")
        return WorkflowResponse(status, content)
    def get(self, url, headers=None): return self.request("GET", url, headers)
    def post(self, url, headers=None, json=None): return self.request("POST", url, headers, json)
    def patch(self, url, headers=None, json=None): return self.request("PATCH", url, headers, json)

class WorkflowResponse:
    def __init__(self, status_code, content): self.status_code, self.content = status_code, content
    @property
    def text(self): return self.content.decode()
    def json(self): return json.loads(self.content)

client = ASGIClient()

def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()
    db.add_all([
        User(id=11, full_name="Driver Test", email="driver@example.com", password=hash_password("DriverPass123"), role="driver", is_active=True),
        User(id=12, full_name="Manager Test", email="manager@example.com", password=hash_password("ManagerPass123"), role="manager", is_active=True),
        User(id=13, full_name="Admin Test", email="admin@example.com", password=hash_password("AdminPass123"), role="admin", is_active=True),
        User(id=14, full_name="Other Driver", email="other@example.com", password=hash_password("OtherPass123"), role="driver", is_active=True),
    ])
    db.add(Vehicle(id=21, vehicle_number="TEST-21", vehicle_type="Van", manufacturer="Test", model="Cargo", manufacture_year=2024, fuel_type="Diesel", status="Assigned", is_active=True, driver_id=11))
    db.commit(); db.close()

def token(email, password):
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]

def headers(jwt):
    return {"Authorization": f"Bearer {jwt}"}

def test_login_errors_and_role_enforcement():
    assert client.post("/auth/login", json={"email": "missing@example.com", "password": "wrong"}).status_code == 401
    assert client.post("/auth/login", json={"email": "driver@example.com", "password": "bad"}).status_code == 401
    assert client.get("/maintenance/").status_code == 401
    assert client.get("/auth/me", headers=headers("invalid-token")).status_code == 401
    driver = token("driver@example.com", "DriverPass123")
    profile = client.get("/auth/me", headers=headers(driver))
    assert profile.status_code == 200 and profile.json()["role"] == "driver"
    assert client.get("/maintenance/", headers=headers(driver)).status_code == 403
    assert client.get("/users/", headers=headers(driver)).status_code == 403
    assert client.get("/dashboard/manager", headers=headers(driver)).status_code == 403
    assert client.get("/dashboard/summary", headers=headers(driver)).status_code == 403
    assert client.post("/vehicles/").status_code == 401
    public_admin = client.post("/auth/signup", json={
        "full_name": "Role Spoof", "email": "spoof@example.com", "password": "Password123", "role": "admin"
    })
    assert public_admin.status_code == 201
    assert public_admin.json()["role"] == "admin" and public_admin.json()["id"]
    admin_login = client.post("/auth/login", json={"email": "spoof@example.com", "password": "Password123"})
    assert admin_login.status_code == 200 and admin_login.json()["user"]["role"] == "admin"
    assert client.get("/dashboard/summary", headers=headers(admin_login.json()["access_token"])).status_code == 200
    assert client.post("/auth/signup", json={
        "full_name": "Invalid Role", "email": "invalid-role@example.com", "password": "Password123", "role": "owner"
    }).status_code == 422
    prefixed_login = client.post("/api/auth/login", json={"email": "driver@example.com", "password": "DriverPass123"})
    assert prefixed_login.status_code == 200
    assert client.get("/api/auth/me", headers=headers(prefixed_login.json()["access_token"])).json()["role"] == "driver"
    manager = token("manager@example.com", "ManagerPass123")
    assert client.get("/users/", headers=headers(manager)).status_code == 403


def test_signup_preserves_selected_driver_and_manager_roles():
    for role, email in (("driver", "new-driver@example.com"), ("manager", "new-manager@example.com")):
        created = client.post("/auth/signup", json={
            "full_name": f"New {role.title()}", "email": email,
            "password": "NewAccountPass123", "role": role,
        })
        assert created.status_code == 201
        assert created.json()["role"] == role and created.json()["id"]
        assert "password" not in created.json()
        db = TestingSession()
        stored_user = db.query(User).filter(User.id == created.json()["id"]).one()
        assert stored_user.role == role
        assert stored_user.password != "NewAccountPass123"
        assert verify_password("NewAccountPass123", stored_user.password)
        db.close()
        login = client.post("/auth/login", json={"email": email, "password": "NewAccountPass123"})
        assert login.status_code == 200
        assert login.json()["user"]["role"] == role
        assert client.get("/auth/me", headers=headers(login.json()["access_token"])).json()["role"] == role
    assert client.post("/auth/login", json={
        "email": "new-manager@example.com", "password": "IncorrectPassword123",
    }).status_code == 401


def test_admin_account_creation_and_protected_provisioning():
    driver = token("driver@example.com", "DriverPass123")
    manager = token("manager@example.com", "ManagerPass123")
    admin = token("admin@example.com", "AdminPass123")
    public_body = {
        "full_name": "Public Admin", "email": "public-admin@example.com",
        "password": "PublicAdminPass123", "role": "admin",
    }
    public_created = client.post("/auth/signup", json=public_body)
    assert public_created.status_code == 201 and public_created.json()["role"] == "admin"
    public_login = client.post("/auth/login", json={"email": public_body["email"], "password": public_body["password"]})
    assert public_login.status_code == 200 and public_login.json()["user"]["role"] == "admin"

    body = {
        "full_name": "Provisioned Admin", "email": "provisioned-admin@example.com",
        "password": "ProvisionedAdminPass123", "role": "admin",
    }
    assert client.post("/users/", headers=headers(driver), json=body).status_code == 403
    assert client.post("/users/", headers=headers(manager), json=body).status_code == 403
    created = client.post("/users/", headers=headers(admin), json=body)
    assert created.status_code == 201 and created.json()["role"] == "admin"
    login = client.post("/auth/login", json={"email": body["email"], "password": body["password"]})
    assert login.status_code == 200 and login.json()["user"]["role"] == "admin"
    assert "password" not in created.json()

def test_manager_driver_admin_workflow_is_persisted():
    manager = token("manager@example.com", "ManagerPass123")
    driver = token("driver@example.com", "DriverPass123")
    admin = token("admin@example.com", "AdminPass123")
    assigned_vehicle = client.patch("/vehicles/21/assignment", headers=headers(manager), json={"driver_id": 11})
    assert assigned_vehicle.status_code == 200 and assigned_vehicle.json()["driver_id"] == 11
    created = client.post("/maintenance/", headers=headers(manager), json={
        "vehicle_id": 21, "assigned_driver_id": 11, "maintenance_type": "Oil change",
        "scheduled_date": "2026-10-12", "remarks": "Check filter",
    })
    assert created.status_code == 201, created.text
    record_id = created.json()["id"]
    assert created.json()["vehicle"]["vehicle_number"] == "TEST-21"
    assert client.get("/maintenance/", headers=headers(admin)).json()[0]["id"] == record_id
    own = client.get("/maintenance/mine", headers=headers(driver))
    assert [item["id"] for item in own.json()] == [record_id]
    assert client.get("/dashboard/driver", headers=headers(driver)).json()["total_assigned"] == 1
    other = token("other@example.com", "OtherPass123")
    assert client.post(f"/maintenance/{record_id}/response", headers=headers(other), json={"response": "Accepted"}).status_code == 404
    assert client.post(f"/maintenance/{record_id}/verify", headers=headers(manager), json={"decision": "Verified"}).status_code == 403
    accepted = client.post(f"/maintenance/{record_id}/response", headers=headers(driver), json={"response": "Accepted"})
    assert accepted.status_code == 200 and accepted.json()["assignment_response"] == "Accepted"
    assert accepted.json()["status"] == "Scheduled"
    assert client.get("/maintenance/", headers=headers(manager)).json()[0]["assignment_response"] == "Accepted"
    assert client.get("/maintenance/", headers=headers(admin)).json()[0]["assignment_response"] == "Accepted"
    assert client.post(f"/maintenance/{record_id}/response", headers=headers(driver), json={"response": "Accepted"}).status_code == 409
    assert client.post(f"/maintenance/{record_id}/start", headers=headers(driver)).json()["status"] == "InProgress"
    assert client.post(f"/maintenance/{record_id}/start", headers=headers(driver)).status_code == 409
    submitted = client.post(f"/maintenance/{record_id}/complete", headers=headers(driver), json={"remarks": "Oil and filter replaced"})
    assert submitted.status_code == 200 and submitted.json()["status"] == "CompletionSubmitted"
    admin_submission = client.get("/maintenance/", headers=headers(admin)).json()[0]
    assert admin_submission["completion_remarks"] == "Oil and filter replaced"
    assert admin_submission["completion_submitted_at"]
    assert client.post(f"/maintenance/{record_id}/verify", headers=headers(admin), json={"decision": "Verified", "remarks": "Reviewed"}).status_code == 200
    manager_view = client.get("/maintenance/", headers=headers(manager)).json()[0]
    assert manager_view["status"] == "Completed" and manager_view["verification_remarks"] == "Reviewed"
    assert manager_view["assignment_response"] == "Accepted" and manager_view["completion_remarks"] == "Oil and filter replaced"
    assert manager_view["verification_history"]
    driver_view = client.get("/maintenance/mine", headers=headers(driver)).json()[0]
    assert driver_view["status"] == "Completed" and driver_view["verification_remarks"] == "Reviewed"
    manager_stats = client.get("/dashboard/manager", headers=headers(manager)).json()
    assert manager_stats["drivers_total"] == 2
    assert manager_stats["drivers"][0]["completed"] == 1
    admin_stats = client.get("/dashboard/summary", headers=headers(admin)).json()
    assert admin_stats["completed_maintenance"] == 1
    assert admin_stats["total_maintenance_records"] == 1
    assert sum(item["count"] for item in admin_stats["status_distribution"]) == 1

def test_assignment_eligibility_and_duplicate_schedule():
    manager = token("manager@example.com", "ManagerPass123")
    assert len(client.get("/users/drivers", headers=headers(manager)).json()) == 2
    assert client.patch("/vehicles/999/assignment", headers=headers(manager), json={"driver_id": 11}).status_code == 404
    assert client.patch("/vehicles/21/assignment", headers=headers(manager), json={"driver_id": 999}).status_code == 422
    first = client.patch("/vehicles/21/assignment", headers=headers(manager), json={"driver_id": 11})
    assert first.status_code == 200
    driver = token("driver@example.com", "DriverPass123")
    assert [vehicle["id"] for vehicle in client.get("/vehicles/", headers=headers(driver)).json()] == [21]
    other_driver = token("other@example.com", "OtherPass123")
    assert client.get("/vehicles/", headers=headers(other_driver)).json() == []
    second = client.patch("/vehicles/21/assignment", headers=headers(manager), json={"driver_id": 14})
    assert second.status_code == 409
    payload = {"vehicle_id": 21, "assigned_driver_id": 11, "maintenance_type": "Inspection", "scheduled_date": "2026-10-13"}
    assert client.post("/maintenance/", headers=headers(manager), json=payload).status_code == 201
    assert client.post("/maintenance/", headers=headers(manager), json=payload).status_code == 409

def test_driver_decline_is_persisted_and_visible_to_management():
    manager = token("manager@example.com", "ManagerPass123")
    driver = token("other@example.com", "OtherPass123")
    assignment = client.post("/maintenance/", headers=headers(manager), json={
        "vehicle_id": 21, "assigned_driver_id": 14, "maintenance_type": "Tire inspection",
        "scheduled_date": "2026-10-15",
    })
    record_id = assignment.json()["id"]
    declined = client.post(f"/maintenance/{record_id}/response", headers=headers(driver), json={"response": "Declined"})
    assert declined.status_code == 200 and declined.json()["assignment_response"] == "Declined"
    assert client.post(f"/maintenance/{record_id}/response", headers=headers(driver), json={"response": "Accepted"}).status_code == 409
    manager_record = client.get("/maintenance/", headers=headers(manager)).json()[0]
    assert manager_record["assignment_response"] == "Declined"
    admin = token("admin@example.com", "AdminPass123")
    admin_record = client.get("/maintenance/", headers=headers(admin)).json()[0]
    assert admin_record["id"] == record_id and admin_record["assignment_response"] == "Declined"
    assert client.get("/dashboard/summary", headers=headers(admin)).json()["declined_assignments"] == 1

def test_admin_rejects_completion_and_keeps_audit_history():
    manager = token("manager@example.com", "ManagerPass123")
    driver = token("driver@example.com", "DriverPass123")
    admin = token("admin@example.com", "AdminPass123")
    scheduled = client.post("/maintenance/", headers=headers(manager), json={
        "vehicle_id": 21, "assigned_driver_id": 11, "maintenance_type": "Brake check",
        "scheduled_date": "2026-10-14",
    })
    record_id = scheduled.json()["id"]
    assert client.post(f"/maintenance/{record_id}/verify", headers=headers(admin), json={"decision": "Verified"}).status_code == 409
    assert client.post("/maintenance/999/verify", headers=headers(admin), json={"decision": "Verified"}).status_code == 404
    assert client.post(f"/maintenance/{record_id}/response", headers=headers(driver), json={"response": "Accepted"}).status_code == 200
    assert client.post(f"/maintenance/{record_id}/start", headers=headers(driver)).status_code == 200
    assert client.post(f"/maintenance/{record_id}/complete", headers=headers(driver), json={"remarks": "Needs another part"}).status_code == 200
    rejected = client.post(f"/maintenance/{record_id}/verify", headers=headers(admin), json={"decision": "Rejected", "remarks": "Please replace the part"})
    assert rejected.status_code == 200 and rejected.json()["status"] == "NeedsRework"
    manager_record = client.get("/maintenance/", headers=headers(manager)).json()[0]
    assert manager_record["verification_remarks"] == "Please replace the part"
    assert len(json.loads(manager_record["verification_history"])) == 1
    assert client.get("/dashboard/summary", headers=headers(admin)).json()["in_progress_maintenance"] == 0

def test_additive_schema_migration_backfills_existing_driver_assignments():
    isolated_engine = create_engine("sqlite://")
    with isolated_engine.begin() as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, full_name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL, is_active BOOLEAN NOT NULL)"))
        connection.execute(text("CREATE TABLE vehicles (id INTEGER PRIMARY KEY, vehicle_number VARCHAR(20) NOT NULL, vehicle_type VARCHAR(50) NOT NULL, manufacturer VARCHAR(100) NOT NULL, model VARCHAR(100) NOT NULL, manufacture_year INTEGER, fuel_type VARCHAR(20), status VARCHAR(20), is_active BOOLEAN, driver_id INTEGER)"))
        connection.execute(text("CREATE TABLE maintenance (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL, maintenance_type VARCHAR(100) NOT NULL, scheduled_date DATE NOT NULL, status VARCHAR(30), remarks VARCHAR(255))"))
        connection.execute(text("CREATE INDEX ix_users_id ON users (id)"))
        connection.execute(text("CREATE INDEX ix_users_email ON users (email)"))
        connection.execute(text("CREATE INDEX ix_vehicles_id ON vehicles (id)"))
        connection.execute(text("CREATE INDEX ix_maintenance_id ON maintenance (id)"))
        connection.execute(text("INSERT INTO users (id, full_name, email, password, role, is_active) VALUES (11, 'Driver', 'old@example.com', 'hash', 'driver', 1)"))
        connection.execute(text("INSERT INTO vehicles (id, vehicle_number, vehicle_type, manufacturer, model, driver_id) VALUES (21, 'OLD-21', 'Van', 'Test', 'Cargo', 11)"))
        connection.execute(text("INSERT INTO maintenance (id, vehicle_id, maintenance_type, scheduled_date, status) VALUES (31, 21, 'Inspection', '2026-10-10', 'completed')"))
    run_schema_migration(isolated_engine)
    columns = {column["name"] for column in inspect(isolated_engine).get_columns("maintenance")}
    with isolated_engine.connect() as connection:
        driver_id, status = connection.execute(text("SELECT assigned_driver_id, status FROM maintenance WHERE id = 31")).one()
    isolated_engine.dispose()
    assert {"assigned_driver_id", "assignment_response", "verification_history"} <= columns
    assert driver_id == 11 and status == "Completed"
