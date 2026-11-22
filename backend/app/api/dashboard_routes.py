"""Dashboard API route: aggregates data across all modules for the UI."""

from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.settlement import SettlementRecord
from app.models.ai_history import AIHistory
from app.schemas.dashboard import DashboardOut, LoanDistributionItem, RecentAIActivity
from app.auth.dependencies import get_current_user
from app.services.scoring_service import calculate_debt_to_income_ratio

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Return an aggregated snapshot of the user's financial and AI activity."""
    loans = db.query(Loan).filter(Loan.user_id == current_user.user_id).all()
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.user_id)
        .first()
    )
    settlements = (
        db.query(SettlementRecord)
        .filter(SettlementRecord.user_id == current_user.user_id)
        .all()
    )
    ai_activities = (
        db.query(AIHistory)
        .filter(AIHistory.user_id == current_user.user_id)
        .order_by(AIHistory.generated_at.desc())
        .limit(5)
        .all()
    )

    total_outstanding = sum(loan.outstanding_amount for loan in loans)
    total_amount = sum(loan.loan_amount for loan in loans)

    distribution_map = defaultdict(lambda: {"total_outstanding": 0.0, "count": 0})
    for loan in loans:
        distribution_map[loan.loan_type]["total_outstanding"] += loan.outstanding_amount
        distribution_map[loan.loan_type]["count"] += 1

    loan_distribution = [
        LoanDistributionItem(
            loan_type=loan_type,
            total_outstanding=round(data["total_outstanding"], 2),
            count=data["count"],
        )
        for loan_type, data in distribution_map.items()
    ]

    dti = 0.0
    financial_health_score = 0.0
    if profile:
        dti = calculate_debt_to_income_ratio(profile.existing_debts, profile.monthly_income)
        financial_health_score = profile.financial_health_score

    avg_settlement_probability = (
        round(sum(s.settlement_prediction for s in settlements) / len(settlements), 2)
        if settlements
        else 0.0
    )

    recent_activities = []
    for activity in ai_activities:
        if activity.negotiation_strategy:
            summary = "Negotiation strategy generated"
        elif activity.settlement_letter:
            summary = "Settlement letter drafted"
        else:
            summary = "Financial advice generated"
        recent_activities.append(
            RecentAIActivity(
                history_id=activity.history_id,
                summary=summary,
                generated_at=activity.generated_at.isoformat() if activity.generated_at else "",
            )
        )

    return DashboardOut(
        total_loans=len(loans),
        total_outstanding_amount=round(total_outstanding, 2),
        total_loan_amount=round(total_amount, 2),
        financial_health_score=financial_health_score,
        debt_to_income_ratio=dti,
        average_settlement_probability=avg_settlement_probability,
        loan_distribution=loan_distribution,
        recent_ai_activities=recent_activities,
        monthly_income=profile.monthly_income if profile else None,
        monthly_expenses=profile.monthly_expenses if profile else None,
    )
