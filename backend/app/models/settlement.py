"""SQLAlchemy model for settlement predictions/records."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class SettlementRecord(Base):
    __tablename__ = "settlement_records"

    settlement_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.loan_id"), nullable=False)
    settlement_prediction = Column(Float, nullable=False)  # probability 0-100
    recommended_amount = Column(Float, nullable=False)
    priority_level = Column(String(20), nullable=False)  # Low / Medium / High / Critical
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="settlement_records")
    loan = relationship("Loan", back_populates="settlement_records")
