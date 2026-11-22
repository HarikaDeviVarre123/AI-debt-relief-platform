"""Settlement prediction API routes."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.settlement import SettlementRecord
from app.schemas.settlement import SettlementPredictRequest, SettlementRecordOut
from app.auth.dependencies import get_current_user
from app.services.scoring_service import calculate_debt_to_income_ratio
from app.services.settlement_service import predict_settlement

logger = logging.getLogger("finrelief")

router = APIRouter(prefix="/settlement", tags=["Settlement"])


@router.get("", response_model=list[SettlementRecordOut])
def get_user_settlements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all settlement predictions and history for the current user."""
    return (
        db.query(SettlementRecord)
        .filter(SettlementRecord.user_id == current_user.user_id)
        .order_by(SettlementRecord.created_at.asc())
        .all()
    )


@router.post("/predict", response_model=SettlementRecordOut, status_code=status.HTTP_201_CREATED)
def predict(
    payload: SettlementPredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run settlement prediction for a specific loan owned by the current user."""
    loan = (
        db.query(Loan)
        .filter(Loan.loan_id == payload.loan_id, Loan.user_id == current_user.user_id)
        .first()
    )
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")

    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    financial_health_score = profile.financial_health_score if profile else 50.0
    dti = (
        calculate_debt_to_income_ratio(profile.existing_debts, profile.monthly_income)
        if profile
        else 30.0
    )

    prediction, recommended_amount, priority = predict_settlement(
        outstanding_amount=loan.outstanding_amount,
        interest_rate=loan.interest_rate,
        financial_health_score=financial_health_score,
        debt_to_income_ratio=dti,
    )

    record = SettlementRecord(
        user_id=current_user.user_id,
        loan_id=loan.loan_id,
        settlement_prediction=prediction,
        recommended_amount=recommended_amount,
        priority_level=priority,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    logger.info(
        "Settlement prediction generated for loan %s: %.2f%% probability",
        loan.loan_id,
        prediction,
    )
    return record
