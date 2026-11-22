"""Pydantic schemas for AI-powered negotiation strategy and letter generation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class StrategyRequest(BaseModel):
    loan_id: int = Field(..., description="ID of the loan to build a negotiation strategy for")
    notes: Optional[str] = Field(
        default=None, description="Any extra context the user wants the AI to consider"
    )


class LetterRequest(BaseModel):
    loan_id: int = Field(..., description="ID of the loan the settlement letter is for")
    offer_amount: Optional[float] = Field(
        default=None, description="The amount the user wishes to offer as settlement"
    )
    tone: Optional[str] = Field(
        default="professional", description="Tone of the letter: professional, firm, empathetic"
    )
    borrower_name: Optional[str] = Field(
        default=None, description="Borrower's full name"
    )
    borrower_address: Optional[str] = Field(
        default=None, description="Borrower's address"
    )
    lender_name: Optional[str] = Field(
        default=None, description="Lender or bank name"
    )
    lender_address: Optional[str] = Field(
        default=None, description="Lender or branch address"
    )
    hardship_reason: Optional[str] = Field(
        default=None, description="Explanation of financial difficulty"
    )


class AIResponseOut(BaseModel):
    history_id: int
    user_id: int
    negotiation_strategy: Optional[str] = None
    settlement_letter: Optional[str] = None
    ai_response: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True
