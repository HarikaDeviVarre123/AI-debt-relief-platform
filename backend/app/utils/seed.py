"""
Seed the database with realistic sample data for local development and demos.

Run with:  python -m app.utils.seed
(from the backend/ directory, with the virtual environment active)
"""

import sys
import os
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, init_db
from app.models.user import User
from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile
from app.models.settlement import SettlementRecord
from app.models.ai_history import AIHistory
from app.auth.security import hash_password
from app.services.scoring_service import (
    calculate_financial_health_score,
    calculate_debt_to_income_ratio,
)
from app.services.settlement_service import predict_settlement


def seed():
    init_db()
    db = SessionLocal()

    try:
        existing = db.query(User).filter(User.email == "demo@finrelief.ai").first()
        if existing:
            print("Sample data already present. Skipping seed.")
            return

        user = User(
            name="Asha Verma",
            email="demo@finrelief.ai",
            password=hash_password("Demo@1234"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile_data = dict(monthly_income=65000.0, monthly_expenses=42000.0, existing_debts=380000.0)
        score = calculate_financial_health_score(**profile_data)
        profile = FinancialProfile(user_id=user.user_id, financial_health_score=score, **profile_data)
        db.add(profile)

        loans_data = [
            dict(
                loan_type="Credit Card",
                loan_amount=150000.0,
                outstanding_amount=120000.0,
                interest_rate=32.0,
                due_date=datetime.now(timezone.utc) + timedelta(days=30),
            ),
            dict(
                loan_type="Personal Loan",
                loan_amount=300000.0,
                outstanding_amount=210000.0,
                interest_rate=18.5,
                due_date=datetime.now(timezone.utc) + timedelta(days=90),
            ),
            dict(
                loan_type="Auto Loan",
                loan_amount=600000.0,
                outstanding_amount=50000.0,
                interest_rate=9.5,
                due_date=datetime.now(timezone.utc) + timedelta(days=60),
            ),
        ]

        loans = []
        for data in loans_data:
            loan = Loan(user_id=user.user_id, **data)
            db.add(loan)
            loans.append(loan)
        db.commit()
        for loan in loans:
            db.refresh(loan)

        dti = calculate_debt_to_income_ratio(profile_data["existing_debts"], profile_data["monthly_income"])
        for loan in loans:
            prediction, recommended, priority = predict_settlement(
                outstanding_amount=loan.outstanding_amount,
                interest_rate=loan.interest_rate,
                financial_health_score=score,
                debt_to_income_ratio=dti,
            )
            db.add(
                SettlementRecord(
                    user_id=user.user_id,
                    loan_id=loan.loan_id,
                    settlement_prediction=prediction,
                    recommended_amount=recommended,
                    priority_level=priority,
                )
            )

        db.add(
            AIHistory(
                user_id=user.user_id,
                negotiation_strategy=(
                    "Open with a 40% offer on the credit card balance, citing "
                    "temporary hardship. Emphasize willingness to pay a lump sum "
                    "now versus risk of continued non-payment."
                ),
                ai_response="Sample negotiation strategy generated during seeding.",
            )
        )

        db.commit()
        print("Database seeded successfully.")
        print("Demo login -> email: demo@finrelief.ai | password: Demo@1234")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
