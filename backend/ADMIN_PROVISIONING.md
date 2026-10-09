# Admin account provisioning

Public signup supports `driver` and `manager` accounts. Requests that select
`admin` are rejected by `/auth/signup`; changing the role in the browser does
not grant administrator access.

To create an administrator locally, sign in with an existing active admin
account and use the protected `POST /users/` endpoint (available in the local
FastAPI docs at `/docs`). Send a normal account payload with `role: "admin"`:

```json
{
  "full_name": "Local Test Admin",
  "email": "local-admin@example.test",
  "password": "choose-a-unique-password",
  "role": "admin"
}
```

This endpoint requires an admin JWT and stores the password using the same
password hashing function as signup. Do not put a real password in source
control. If a local database has no administrator yet, provision the first
account through a trusted, one-time operator process using the application's
`hash_password` helper and the configured `DATABASE_URL`; do not temporarily
open public admin signup. The workflow tests create their admin account only
inside an isolated in-memory SQLite database.
