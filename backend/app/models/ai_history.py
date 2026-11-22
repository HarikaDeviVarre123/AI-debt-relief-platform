"""SQLAlchemy model for storing AI-generated content history."""

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class AIHistory(Base):
    __tablename__ = "ai_history"

    history_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    negotiation_strategy = Column(Text, nullable=True)
    settlement_letter = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="ai_history")
