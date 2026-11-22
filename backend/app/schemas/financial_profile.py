"""Pydantic schemas for financial profile creation, updates, and responses."""

from typing import Optional
from pydantic import BaseModel, Field


class FinancialProfileCreate(BaseModel):
    monthly_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)
    existing_debts: float = Field(..., ge=0)


class FinancialProfileUpdate(BaseModel):
    monthly_income: Optional[float] = Field(default=None, ge=0)
    monthly_expenses: Optional[float] = Field(default=None, ge=0)
    existing_debts: Optional[float] = Field(default=None, ge=0)


class FinancialProfileOut(BaseModel):
    profile_id: int
    user_id: int
    monthly_income: float
    monthly_expenses: float
    existing_debts: float
    financial_health_score: float

    class Config:
        from_attributes = True
