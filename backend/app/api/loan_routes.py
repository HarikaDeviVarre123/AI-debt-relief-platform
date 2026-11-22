"""Loan CRUD API routes, scoped to the authenticated user."""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.schemas.loan import LoanCreate, LoanUpdate, LoanOut
from app.auth.dependencies import get_current_user

logger = logging.getLogger("finrelief")

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.get("", response_model=List[LoanOut])
def get_loans(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """List all loans belonging to the current user."""
    return db.query(Loan).filter(Loan.user_id == current_user.user_id).all()


@router.post("", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def create_loan(
    payload: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new loan for the current user."""
    loan = Loan(user_id=current_user.user_id, **payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    logger.info("Loan created for user %s: %s", current_user.user_id, loan.loan_type)
    return loan


def _get_owned_loan(loan_id: int, db: Session, current_user: User) -> Loan:
    loan = (
        db.query(Loan)
        .filter(Loan.loan_id == loan_id, Loan.user_id == current_user.user_id)
        .first()
    )
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    return loan


@router.put("/{loan_id}", response_model=LoanOut)
def update_loan(
    loan_id: int,
    payload: LoanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update fields on an existing loan owned by the current user."""
    loan = _get_owned_loan(loan_id, db, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(loan, field, value)
    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a loan owned by the current user."""
    loan = _get_owned_loan(loan_id, db, current_user)
    db.delete(loan)
    db.commit()
    return None
