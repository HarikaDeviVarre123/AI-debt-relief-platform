"""Pydantic schemas for settlement prediction requests and responses."""

from datetime import datetime
from pydantic import BaseModel, Field


class SettlementPredictRequest(BaseModel):
    loan_id: int = Field(..., description="ID of the loan to analyze")


class SettlementRecordOut(BaseModel):
    settlement_id: int
    user_id: int
    loan_id: int
    settlement_prediction: float
    recommended_amount: float
    priority_level: str
    created_at: datetime

    class Config:
        from_attributes = True
