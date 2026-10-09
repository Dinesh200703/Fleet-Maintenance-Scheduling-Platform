-- Applied automatically by app.database.ensure_schema() on backend startup.
-- This file documents the equivalent additive MySQL DDL; do not run it if the
-- automatic schema migration has already run.
ALTER TABLE maintenance
  ADD COLUMN assigned_driver_id INT NULL,
  ADD COLUMN assignment_response VARCHAR(20) NOT NULL DEFAULT 'Pending',
  ADD COLUMN response_at DATETIME NULL,
  ADD COLUMN completion_remarks VARCHAR(500) NULL,
  ADD COLUMN completion_submitted_at DATETIME NULL,
  ADD COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'NotSubmitted',
  ADD COLUMN verification_remarks VARCHAR(500) NULL,
  ADD COLUMN verification_history TEXT NULL,
  ADD COLUMN verified_by INT NULL,
  ADD COLUMN verified_at DATETIME NULL;
ALTER TABLE maintenance
  ADD CONSTRAINT fk_maintenance_assigned_driver FOREIGN KEY (assigned_driver_id) REFERENCES users(id),
  ADD CONSTRAINT fk_maintenance_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
  ADD INDEX ix_maintenance_assigned_driver_id (assigned_driver_id);

