# API Documentation — FinRelief AI

Base URL (local): `http://127.0.0.1:8000`

Interactive Swagger UI is available at **`/docs`** and ReDoc at **`/redoc`**
whenever the backend is running — both are generated automatically by
FastAPI from the Pydantic schemas in `backend/app/schemas/`.

All endpoints except `/`, `/health`, `/register`, and `/login` require a
JWT bearer token:

```
Authorization: Bearer <access_token>
```

Tokens are returned by `/register` and `/login` and expire after
`ACCESS_TOKEN_EXPIRE_MINUTES` (default 60).

---

## Authentication

### `POST /register`
Create a new account.

**Body**
```json
{ "name": "Asha Verma", "email": "asha@example.com", "password": "Demo@1234" }
```

**Response `201`**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "user_id": 1, "name": "Asha Verma", "email": "asha@example.com", "created_at": "2026-07-16T00:00:00" }
}
```

### `POST /login`
Authenticate with email/password.

**Body**
```json
{ "email": "asha@example.com", "password": "Demo@1234" }
```

**Response `200`**: same shape as `/register`.

---

## Users

### `GET /users`
List all registered users. *Requires auth.*

---

## Loans

### `GET /loans`
List loans for the current user. *Requires auth.*

### `POST /loans`
Create a loan. *Requires auth.*
```json
{
  "loan_type": "Credit Card",
  "loan_amount": 150000,
  "outstanding_amount": 120000,
  "interest_rate": 32.0,
  "due_date": "2026-12-01T00:00:00"
}
```

### `PUT /loans/{loan_id}`
Update any subset of loan fields. *Requires auth, must own the loan.*

### `DELETE /loans/{loan_id}`
Delete a loan. Returns `204 No Content`. *Requires auth, must own the loan.*

---

## Financial Profile

### `GET /financial-profile`
Get the current user's profile. `404` if not yet created.

### `POST /financial-profile`
Create the profile (one per user). Automatically computes
`financial_health_score`.
```json
{ "monthly_income": 65000, "monthly_expenses": 42000, "existing_debts": 380000 }
```

### `PUT /financial-profile`
Update any subset of fields; recomputes the health score.

---

## Settlement

### `GET /settlement`
Retrieve all past settlement predictions and records for the authenticated user.

**Response `200`**
```json
[
  {
    "settlement_id": 1,
    "user_id": 1,
    "loan_id": 1,
    "settlement_prediction": 68.0,
    "recommended_amount": 78000.0,
    "priority_level": "High",
    "created_at": "2026-07-16T00:00:00"
  }
]
```

### `POST /settlement/predict`
Run the settlement prediction model for a loan owned by the current user.
```json
{ "loan_id": 1 }
```

**Response `201`**
```json
{
  "settlement_id": 1,
  "user_id": 1,
  "loan_id": 1,
  "settlement_prediction": 68.0,
  "recommended_amount": 78000.0,
  "priority_level": "High",
  "created_at": "2026-07-16T00:00:00"
}
```

---

## AI (Google Gemini)

### `POST /ai/strategy`
Generate a negotiation strategy for a loan.
```json
{ "loan_id": 1, "notes": "Recently lost my job, can offer a lump sum in 2 weeks" }
```

### `POST /ai/letter`
Draft a settlement offer letter.
```json
{ "loan_id": 1, "offer_amount": 70000, "tone": "professional" }
```

### `POST /ai/advice`
Generate general financial advice from the user's saved financial profile.
No request body required.

All three endpoints persist their output to `AIHistory` and return an
`AIResponseOut` object (`history_id`, the relevant text field(s), and
`generated_at`).

> If `GEMINI_API_KEY` is not configured in `.env`, these endpoints fall back
> to a deterministic offline template so the feature still works end-to-end
> in demos without an API key.

---

## Dashboard

### `GET /dashboard`
Aggregated snapshot for the UI: total loans, outstanding/loan amounts,
financial health score, debt-to-income ratio, average settlement
probability, loan distribution by type, and the 5 most recent AI
activities.

---

## Health

### `GET /` and `GET /health`
Simple liveness checks, no auth required. Used by Docker healthchecks.

---

## Error format

All errors return:
```json
{ "detail": "Human-readable message" }
```
or, for validation errors (`422`), a list of field-level issues under
`detail`, matching FastAPI/Pydantic's default shape.
