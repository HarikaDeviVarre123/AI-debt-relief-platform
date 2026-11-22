"""
Settlement prediction service.

Provides deterministic, explainable heuristics for:
  - Settlement probability (0-100): likelihood a creditor would accept
    a negotiated settlement given the loan and the user's financial state.
  - Recommended settlement amount: a suggested offer, typically a
    percentage of the outstanding balance.
  - Priority level: which debt the user should focus on negotiating first.

These are rule-based (not a black box), which is important for a debt
relief product where recommendations must be explainable to users.
"""

from typing import Tuple


def predict_settlement(
    outstanding_amount: float,
    interest_rate: float,
    financial_health_score: float,
    debt_to_income_ratio: float,
) -> Tuple[float, float, str]:
    """
    Returns (settlement_prediction_percent, recommended_amount, priority_level).
    """
    # Base probability starts higher for high-interest, high-balance debt,
    # since creditors are often more willing to negotiate on those.
    base_probability = 40.0

    if interest_rate >= 20:
        base_probability += 20
    elif interest_rate >= 12:
        base_probability += 10

    if outstanding_amount >= 500000:
        base_probability += 15
    elif outstanding_amount >= 100000:
        base_probability += 8

    # A financially strained user (low health score, high DTI) is seen by
    # creditors as more likely to default, which paradoxically increases
    # willingness to settle for less rather than risk getting nothing.
    if financial_health_score < 30:
        base_probability += 15
    elif financial_health_score < 50:
        base_probability += 8

    if debt_to_income_ratio > 50:
        base_probability += 10
    elif debt_to_income_ratio > 30:
        base_probability += 5

    settlement_prediction = round(min(base_probability, 97.0), 2)

    # Recommended settlement discount scales with probability: the more
    # likely a creditor is to negotiate, the more aggressive the ask.
    if settlement_prediction >= 80:
        discount = 0.55
    elif settlement_prediction >= 65:
        discount = 0.45
    elif settlement_prediction >= 50:
        discount = 0.35
    else:
        discount = 0.20

    recommended_amount = round(outstanding_amount * (1 - discount), 2)

    # Priority: prioritize high-balance, high-interest debt with strong
    # settlement odds, since it yields the biggest relief per negotiation.
    priority_score = (outstanding_amount / 10000) + (interest_rate * 2) + (settlement_prediction / 5)
    if priority_score >= 80:
        priority_level = "Critical"
    elif priority_score >= 50:
        priority_level = "High"
    elif priority_score >= 25:
        priority_level = "Medium"
    else:
        priority_level = "Low"

    return settlement_prediction, recommended_amount, priority_level
