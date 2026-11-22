# FinRelief AI — Project Presentation & Viva Guide

Use this guide for project demos, viva questions, technical interviews, and client presentations.

---

## 1. The 60-Second Elevator Pitch

> *"FinRelief AI is an AI-powered financial recovery and debt settlement intelligence platform built using FastAPI, React 19, and Google Gemini 1.5 Flash. Traditional debt management tools are either opaque or merely report past defaults. FinRelief AI empowers borrowers with proactive tools: an explainable 0–100 Financial Health Score, an empirical Creditor Settlement Prediction Engine, and a Google Gemini AI assistant that drafts customized negotiation strategies and formal settlement letters in seconds. It is built with production-grade security, JWT authentication, and an intelligent offline fallback engine that guarantees zero system downtime even without external API access."*

---

## 2. Key Architectural Highlights to Showcase

| Component | Technical Details | Value Proposition |
|-----------|-------------------|-------------------|
| **Frontend** | React 19, Tailwind CSS, Recharts, Vite | Sleek dark-mode fintech interface, reactive animations, live SVG Recovery Arc gauge |
| **Backend** | FastAPI, Python 3.12, Pydantic, SQLAlchemy | Async REST API, OpenAPI/Swagger docs (`/docs`), automated validation |
| **AI Layer** | Google Gemini 1.5 Flash + Local Fallback | Context-aware prompt engineering, customized settlement letters, 100% offline uptime |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | Normalized 3NF schema, cascade constraints, indexed user sessions |
| **Security** | Bcrypt (12 rounds), JWT (HS256) | Zero plaintext storage, strict user isolation (Row-Level Security) |

---

## 3. Live Demonstration Walkthrough Steps

1. **Landing Page:**
   - Show the modern, responsive landing page with the interactive SVG Recovery Arc and explainable score pillars.
2. **Authentication:**
   - Log in using demo credentials (`demo@finrelief.ai` / `Demo@1234`) or register a new user.
3. **Overview Dashboard:**
   - Point out the 4 key metrics: Total Loans, Outstanding Debt, DTI Ratio, and Average Settlement Odds.
   - Highlight the interactive charts: Loan Distribution (Donut chart), Outstanding by Loan (Bar chart), and Recent AI History.
4. **Loans Ledger:**
   - Add a new loan (Credit Card, Personal, Auto, Mortgage) with interest rate and due date.
   - Show live CRUD updates and balance recalculation.
5. **Settlement Intelligence:**
   - Explain the Settlement Prediction algorithm (combining interest rate, hardship, and debt-to-income).
   - Click "Predict Settlement" on any loan to see real-time probability percentage, recommended lump-sum offer, and priority badge (High/Medium/Low).
6. **Gemini AI Assistant:**
   - **Tab 1: Negotiation Strategy:** Select a loan, provide optional context (e.g. "Recently lost job"), and generate an actionable negotiation battle plan.
   - **Tab 2: Settlement Letter:** Select tone (Professional, Firm, Empathetic), generate a formal bank-ready offer letter, and click the **"📋 Copy text"** button.
   - **Tab 3: Financial Advice:** Generate holistic recovery advice based on the user's profile.

---

## 4. Frequent Technical Questions & Answers (Viva & Interview Q&A)

### Q1: How is the Financial Health Score calculated? Is it an arbitrary number?
**Answer:** No, it is a transparent, deterministic mathematical model bounded between 0 and 100. It weights three fundamental financial metrics:
- **Savings Ratio (40% weight):** $((\text{Income} - \text{Expenses}) / \text{Income}) \times 40$
- **Debt-to-Income Ratio (35% weight):** Penalizes debts exceeding annual income.
- **Expense Burden (25% weight):** Evaluates fixed overhead obligations against revenue.

### Q2: How does the Settlement Prediction model work?
**Answer:** Creditors are mathematically more likely to accept a discounted lump-sum settlement when two conditions meet: high loan charge-off risk (very high interest rates like credit cards $> 20\%$) and verified borrower hardship (lower financial health score and high DTI). The formula calculates an empirical probability score and suggests a realistic settlement range ($50\%–75\%$ of outstanding debt).

### Q3: What happens if the Google Gemini API is down, rate-limited, or has no API key?
**Answer:** FinRelief AI features a resilient **Graceful Degradation Fallback Engine**. The backend checks API availability and automatically switches to an internal rule-based generation model. The end-user never experiences broken pages or 500 errors.

### Q4: How is user data isolated?
**Answer:** Authentication is enforced via JWT Bearer tokens. Every FastAPI route depends on `get_current_user`, and all SQLAlchemy database queries explicitly enforce `filter(Model.user_id == current_user.user_id)`. A user can never access or modify another user's financial profile, loans, or AI history.

---

## 5. Quick Launch Commands

To start the platform on Windows:
- Double-click **`start_all.bat`** (starts both Backend on port 8000 and Frontend on port 5173).
- Or run individually:
  - Backend: **`start_backend.bat`**
  - Frontend: **`start_frontend.bat`**
