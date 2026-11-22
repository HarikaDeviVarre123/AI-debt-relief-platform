# Database Schema — FinRelief AI

FinRelief AI uses **SQLite** by default (file: `backend/finrelief.db`), managed
through SQLAlchemy's ORM. Because the code depends only on standard SQLAlchemy
types and `DATABASE_URL`, swapping to Postgres or MySQL requires no code
changes — only a different connection string in `.env`.

See `docs/ER_Diagram.png` for the visual entity-relationship diagram.

---

## Tables

### `users`

| Column       | Type          | Constraints                  |
|--------------|---------------|-------------------------------|
| user_id      | Integer       | Primary key, autoincrement    |
| name         | String(120)   | Not null                      |
| email        | String(180)   | Unique, indexed, not null     |
| password     | String(255)   | Not null (bcrypt hash)        |
| created_at   | DateTime      | Server default `now()`        |

### `loans`

| Column              | Type        | Constraints                        |
|---------------------|-------------|-------------------------------------|
| loan_id             | Integer     | Primary key, autoincrement          |
| user_id             | Integer     | Foreign key → `users.user_id`       |
| loan_type           | String(80)  | Not null                            |
| loan_amount         | Float       | Not null                            |
| outstanding_amount  | Float       | Not null                            |
| interest_rate       | Float       | Not null                            |
| due_date            | DateTime    | Nullable                            |

### `financial_profiles`

| Column                  | Type    | Constraints                                |
|-------------------------|---------|----------------------------------------------|
| profile_id              | Integer | Primary key, autoincrement                    |
| user_id                 | Integer | Foreign key → `users.user_id`, unique (1:1)   |
| monthly_income          | Float   | Not null                                      |
| monthly_expenses        | Float   | Not null                                      |
| existing_debts          | Float   | Not null                                      |
| financial_health_score  | Float   | Not null, default 0.0                         |

### `settlement_records`

| Column                 | Type        | Constraints                        |
|-------------------------|-------------|--------------------------------------|
| settlement_id           | Integer     | Primary key, autoincrement           |
| user_id                 | Integer     | Foreign key → `users.user_id`        |
| loan_id                 | Integer     | Foreign key → `loans.loan_id`        |
| settlement_prediction   | Float       | Not null (0-100, % probability)      |
| recommended_amount      | Float       | Not null                             |
| priority_level          | String(20)  | Not null (`Low`/`Medium`/`High`/`Critical`) |
| created_at              | DateTime    | Server default `now()`               |

### `ai_history`

| Column                | Type     | Constraints                       |
|------------------------|----------|-------------------------------------|
| history_id             | Integer  | Primary key, autoincrement          |
| user_id                | Integer  | Foreign key → `users.user_id`       |
| negotiation_strategy   | Text     | Nullable                            |
| settlement_letter      | Text     | Nullable                            |
| ai_response            | Text     | Nullable                            |
| generated_at           | DateTime | Server default `now()`              |

---

## Relationships

- `users` 1—many `loans`
- `users` 1—1 `financial_profiles`
- `users` 1—many `settlement_records`
- `users` 1—many `ai_history`
- `loans` 1—many `settlement_records`

All child records cascade-delete when the parent `user` is deleted
(`cascade="all, delete-orphan"` on the ORM relationships).

## Notes on scoring formulas

- **Financial Health Score** (0-100): weighted blend of savings rate (50%),
  debt-to-income ratio (35%), and expense ratio (15%). See
  `backend/app/services/scoring_service.py`.
- **Debt-to-Income Ratio**: `existing_debts / monthly_income * 100`.
- **Settlement Prediction**: rule-based heuristic factoring in interest rate,
  outstanding balance, financial health score, and DTI. See
  `backend/app/services/settlement_service.py`.

Both scoring services are pure functions with no side effects, so they can be
unit tested independently of the database or API layer.
