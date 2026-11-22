"""Financial profile CRUD API routes, scoped to the authenticated user."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.schemas.financial_profile import (
    FinancialProfileCreate,
    FinancialProfileUpdate,
    FinancialProfileOut,
)
from app.auth.dependencies import get_current_user
from app.services.scoring_service import calculate_financial_health_score

logger = logging.getLogger("finrelief")

router = APIRouter(prefix="/financial-profile", tags=["Financial Profile"])


@router.get("", response_model=FinancialProfileOut)
def get_profile(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get the current user's financial profile."""
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Financial profile not found"
        )
    return profile


@router.post("", response_model=FinancialProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create the current user's financial profile (one per user)."""
    existing = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Financial profile already exists. Use PUT to update it.",
        )

    score = calculate_financial_health_score(
        payload.monthly_income, payload.monthly_expenses, payload.existing_debts
    )
    profile = FinancialProfile(
        user_id=current_user.user_id,
        monthly_income=payload.monthly_income,
        monthly_expenses=payload.monthly_expenses,
        existing_debts=payload.existing_debts,
        financial_health_score=score,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    logger.info("Financial profile created for user %s", current_user.user_id)
    return profile


@router.put("", response_model=FinancialProfileOut)
def update_profile(
    payload: FinancialProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's financial profile and recompute the score."""
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Financial profile not found"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    profile.financial_health_score = calculate_financial_health_score(
        profile.monthly_income, profile.monthly_expenses, profile.existing_debts
    )
    db.commit()
    db.refresh(profile)
    return profile
