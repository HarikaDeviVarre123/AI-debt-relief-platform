"""Pydantic schemas for loan creation, updates, and responses."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LoanCreate(BaseModel):
    loan_type: str = Field(..., min_length=2, max_length=80)
    loan_amount: float = Field(..., gt=0)
    outstanding_amount: float = Field(..., ge=0)
    interest_rate: float = Field(..., ge=0, le=100)
    due_date: Optional[datetime] = None


class LoanUpdate(BaseModel):
    loan_type: Optional[str] = None
    loan_amount: Optional[float] = Field(default=None, gt=0)
    outstanding_amount: Optional[float] = Field(default=None, ge=0)
    interest_rate: Optional[float] = Field(default=None, ge=0, le=100)
    due_date: Optional[datetime] = None


class LoanOut(BaseModel):
    loan_id: int
    user_id: int
    loan_type: str
    loan_amount: float
    outstanding_amount: float
    interest_rate: float
    due_date: Optional[datetime] = None

    class Config:
        from_attributes = True
