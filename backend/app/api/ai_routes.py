"""AI-powered negotiation strategy, settlement letter, and advice routes."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.ai_history import AIHistory
from app.schemas.ai import StrategyRequest, LetterRequest, AIResponseOut
from app.auth.dependencies import get_current_user
from app.services import ai_service

logger = logging.getLogger("finrelief")

router = APIRouter(prefix="/ai", tags=["AI"])


def _get_owned_loan(loan_id: int, db: Session, current_user: User) -> Loan:
    loan = (
        db.query(Loan)
        .filter(Loan.loan_id == loan_id, Loan.user_id == current_user.user_id)
        .first()
    )
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    return loan


@router.post("/strategy", response_model=AIResponseOut, status_code=status.HTTP_201_CREATED)
def generate_strategy(
    payload: StrategyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI negotiation strategy for a given loan."""
    loan = _get_owned_loan(payload.loan_id, db, current_user)
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    health_score = profile.financial_health_score if profile else 50.0

    strategy = ai_service.generate_negotiation_strategy(
        loan_type=loan.loan_type,
        outstanding_amount=loan.outstanding_amount,
        interest_rate=loan.interest_rate,
        financial_health_score=health_score,
        notes=payload.notes or "",
    )

    history = AIHistory(
        user_id=current_user.user_id,
        negotiation_strategy=strategy,
        ai_response=strategy,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    logger.info("AI negotiation strategy generated for user %s", current_user.user_id)
    return history


@router.post("/letter", response_model=AIResponseOut, status_code=status.HTTP_201_CREATED)
def generate_letter(
    payload: LetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI-drafted settlement offer letter for a given loan."""
    loan = _get_owned_loan(payload.loan_id, db, current_user)
    offer_amount = payload.offer_amount or round(loan.outstanding_amount * 0.6, 2)

    letter = ai_service.generate_settlement_letter(
        loan_type=loan.loan_type,
        outstanding_amount=loan.outstanding_amount,
        offer_amount=offer_amount,
        tone=payload.tone or "professional",
        borrower_name=payload.borrower_name or current_user.name,
        borrower_address=payload.borrower_address,
        lender_name=payload.lender_name,
        lender_address=payload.lender_address,
        hardship_reason=payload.hardship_reason,
    )

    history = AIHistory(
        user_id=current_user.user_id,
        settlement_letter=letter,
        ai_response=letter,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    logger.info("AI settlement letter generated for user %s", current_user.user_id)
    return history


@router.post("/advice", response_model=AIResponseOut, status_code=status.HTTP_201_CREATED)
def generate_advice(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Generate general AI financial advice and repayment suggestions."""
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a financial profile first to receive tailored advice",
        )

    advice = ai_service.generate_financial_advice(
        monthly_income=profile.monthly_income,
        monthly_expenses=profile.monthly_expenses,
        existing_debts=profile.existing_debts,
        financial_health_score=profile.financial_health_score,
    )

    history = AIHistory(
        user_id=current_user.user_id,
        ai_response=advice,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    logger.info("AI financial advice generated for user %s", current_user.user_id)
    return history
