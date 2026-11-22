"""
Financial scoring service.

Contains the pure business logic for computing a user's Financial Health
Score and Debt-to-Income ratio. Kept separate from the API layer so the
math can be unit tested independently and reused by the dashboard and
settlement modules.
"""


def calculate_debt_to_income_ratio(existing_debts: float, monthly_income: float) -> float:
    """
    Debt-to-Income ratio expressed as a percentage of monthly income
    that is currently committed to debt obligations.
    """
    if monthly_income <= 0:
        return 100.0
    ratio = (existing_debts / monthly_income) * 100
    return round(min(ratio, 999.99), 2)


def calculate_financial_health_score(
    monthly_income: float, monthly_expenses: float, existing_debts: float
) -> float:
    """
    Compute a 0-100 Financial Health Score.

    The score blends three signals:
      - Savings rate: how much of income is left after expenses (50% weight)
      - Debt-to-income ratio: how burdened income is by debt (35% weight)
      - Expense ratio: how much of income goes to expenses (15% weight)

    Higher is healthier. The formula is deterministic and explainable,
    which matters for a financial product where users need to trust and
    understand their score.
    """
    if monthly_income <= 0:
        return 0.0

    savings_rate = max((monthly_income - monthly_expenses) / monthly_income, -1.0)
    savings_score = max(min((savings_rate + 0.5) / 1.0, 1.0), 0.0) * 100

    dti = calculate_debt_to_income_ratio(existing_debts, monthly_income)
    dti_score = max(1 - (dti / 100), 0.0) * 100

    expense_ratio = min(monthly_expenses / monthly_income, 2.0)
    expense_score = max(1 - (expense_ratio / 1.5), 0.0) * 100

    final_score = (savings_score * 0.5) + (dti_score * 0.35) + (expense_score * 0.15)
    return round(max(min(final_score, 100.0), 0.0), 2)
