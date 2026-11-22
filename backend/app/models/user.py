"""SQLAlchemy model for application users."""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # stores the bcrypt hash
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loans = relationship("Loan", back_populates="owner", cascade="all, delete-orphan")
    financial_profile = relationship(
        "FinancialProfile",
        back_populates="owner",
        uselist=False,
        cascade="all, delete-orphan",
    )
    settlement_records = relationship(
        "SettlementRecord", back_populates="owner", cascade="all, delete-orphan"
    )
    ai_history = relationship(
        "AIHistory", back_populates="owner", cascade="all, delete-orphan"
    )
