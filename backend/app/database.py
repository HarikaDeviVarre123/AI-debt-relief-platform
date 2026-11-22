"""
Database configuration for FinRelief AI.

Sets up the SQLAlchemy engine, session factory, and declarative base used
throughout the application. SQLite is used as the database engine for
simplicity and portability, but the code is written so that swapping the
`DATABASE_URL` for a Postgres/MySQL URL requires no other changes.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("finrelief")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finrelief.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session and guarantees
    it is closed after the request completes, even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all tables defined on Base's metadata. Called on application
    startup. Import models before calling this so they register with Base.
    """
    from app.models import user, loan, financial_profile, settlement, ai_history  # noqa: F401

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created (or already exist).")
