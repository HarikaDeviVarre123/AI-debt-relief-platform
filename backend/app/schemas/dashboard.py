"""Pydantic schemas for the dashboard aggregate response."""

from typing import List, Optional
from pydantic import BaseModel


class LoanDistributionItem(BaseModel):
    loan_type: str
    total_outstanding: float
    count: int


class RecentAIActivity(BaseModel):
    history_id: int
    summary: str
    generated_at: str


class DashboardOut(BaseModel):
    total_loans: int
    total_outstanding_amount: float
    total_loan_amount: float
    financial_health_score: float
    debt_to_income_ratio: float
    average_settlement_probability: float
    loan_distribution: List[LoanDistributionItem]
    recent_ai_activities: List[RecentAIActivity]
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
