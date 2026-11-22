"""User listing routes (admin-style, protected)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User
from app.schemas.user import UserOut
from app.auth.dependencies import get_current_user

router = APIRouter(tags=["Users"])


@router.get("/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Return all registered users. Requires authentication."""
    return db.query(User).all()
