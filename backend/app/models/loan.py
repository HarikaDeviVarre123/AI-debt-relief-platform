"""SQLAlchemy model for user loans/debts."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Loan(Base):
    __tablename__ = "loans"

    loan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    loan_type = Column(String(80), nullable=False)
    loan_amount = Column(Float, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=True)

    owner = relationship("User", back_populates="loans")
    settlement_records = relationship(
        "SettlementRecord", back_populates="loan", cascade="all, delete-orphan"
    )
