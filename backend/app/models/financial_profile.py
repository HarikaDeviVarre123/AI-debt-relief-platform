"""SQLAlchemy model for user financial profiles."""

from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    monthly_income = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    existing_debts = Column(Float, nullable=False)
    financial_health_score = Column(Float, nullable=False, default=0.0)

    owner = relationship("User", back_populates="financial_profile")
