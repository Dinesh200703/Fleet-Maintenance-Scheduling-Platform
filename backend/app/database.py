import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env", override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be set in backend/.env")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_schema(target_engine=engine):
    """Create missing tables and add the workflow columns to existing tables safely."""
    inspector = inspect(target_engine)
    if "maintenance" not in inspector.get_table_names():
        Base.metadata.create_all(bind=target_engine)
        return
    existing = {column["name"] for column in inspector.get_columns("maintenance")}
    definitions = {
        "assigned_driver_id": "INTEGER NULL",
        "assignment_response": "VARCHAR(20) NOT NULL DEFAULT 'Pending'",
        "response_at": "DATETIME NULL",
        "completion_remarks": "VARCHAR(500) NULL",
        "completion_submitted_at": "DATETIME NULL",
        "verification_status": "VARCHAR(20) NOT NULL DEFAULT 'NotSubmitted'",
        "verification_remarks": "VARCHAR(500) NULL",
        "verification_history": "TEXT NULL",
        "verified_by": "INTEGER NULL",
        "verified_at": "DATETIME NULL",
    }
    with target_engine.begin() as connection:
        for name, definition in definitions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE maintenance ADD COLUMN {name} {definition}"))
    # Create indexes and any other missing tables after the additive columns exist.
    Base.metadata.create_all(bind=target_engine)
    if target_engine.dialect.name == "mysql":
        inspector = inspect(target_engine)
        foreign_keys = inspect(target_engine).get_foreign_keys("maintenance")
        foreign_columns = {tuple(fk["constrained_columns"]) for fk in foreign_keys}
        indexes = {index["name"] for index in inspector.get_indexes("maintenance")}
        with target_engine.begin() as connection:
            if ("assigned_driver_id",) not in foreign_columns:
                connection.execute(text(
                    "ALTER TABLE maintenance ADD CONSTRAINT fk_maintenance_assigned_driver "
                    "FOREIGN KEY (assigned_driver_id) REFERENCES users(id)"
                ))
            if ("verified_by",) not in foreign_columns:
                connection.execute(text(
                    "ALTER TABLE maintenance ADD CONSTRAINT fk_maintenance_verified_by "
                    "FOREIGN KEY (verified_by) REFERENCES users(id)"
                ))
            if "ix_maintenance_assigned_driver_id" not in indexes:
                connection.execute(text(
                    "CREATE INDEX ix_maintenance_assigned_driver_id ON maintenance (assigned_driver_id)"
                ))
    if "assigned_driver_id" not in existing:
        with target_engine.begin() as connection:
            connection.execute(text(
                "UPDATE maintenance SET assigned_driver_id = "
                "(SELECT vehicles.driver_id FROM vehicles WHERE vehicles.id = maintenance.vehicle_id) "
                "WHERE assigned_driver_id IS NULL"
            ))
    if "status" in existing:
        with target_engine.begin() as connection:
            connection.execute(text(
                "UPDATE maintenance SET status = CASE LOWER(status) "
                "WHEN 'completed' THEN 'Completed' WHEN 'scheduled' THEN 'Scheduled' "
                "WHEN 'in progress' THEN 'InProgress' WHEN 'inprogress' THEN 'InProgress' "
                "WHEN 'pending' THEN 'Scheduled' ELSE status END"
            ))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
