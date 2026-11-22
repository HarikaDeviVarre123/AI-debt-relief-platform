"""
FinRelief AI - FastAPI application entry point.

Wires together the database, middleware, and all API routers. Run with:
    uvicorn main:app --reload
from the backend/ directory.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.database import init_db
from app.utils.logger import configure_logging
from app.api import (
    auth_routes,
    user_routes,
    loan_routes,
    financial_profile_routes,
    settlement_routes,
    ai_routes,
    dashboard_routes,
)

logger = configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FinRelief AI backend...")
    init_db()
    yield
    logger.info("Shutting down FinRelief AI backend.")


app = FastAPI(
    title="FinRelief AI",
    description=(
        "AI Powered Debt Relief & Financial Recovery Platform. "
        "Provides loan tracking, financial health scoring, settlement "
        "prediction, and Gemini-powered negotiation assistance."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning("HTTP %s at %s: %s", exc.status_code, request.url.path, exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error at %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error at %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(loan_routes.router)
app.include_router(financial_profile_routes.router)
app.include_router(settlement_routes.router)
app.include_router(ai_routes.router)
app.include_router(dashboard_routes.router)


@app.get("/", tags=["Health"])
def root():
    """Simple health check / welcome endpoint."""
    return {
        "status": "ok",
        "service": "FinRelief AI",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for uptime monitoring and container orchestration."""
    return {"status": "healthy"}
