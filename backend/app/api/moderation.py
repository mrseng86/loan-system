from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.config import settings
from app.db.session import get_db
from app.models.customer import Customer
from app.models.loan import Loan
from app.models.user import User, UserRole
from app.schemas.moderation import ModerationResultRead, ModerationStatus
from app.services.ai_moderation_service import (
    AIModerationError,
    build_customer_snapshot,
    build_loan_snapshot,
    run_moderation,
)

router = APIRouter(prefix="/moderation", tags=["moderation"])


def _to_read(result, when: datetime) -> ModerationResultRead:
    return ModerationResultRead(
        risk_score=Decimal(str(round(result.risk_score, 2))),
        risk_level=result.risk_level,
        recommendation=result.recommendation,
        reasoning=result.reasoning,
        red_flags=result.red_flags,
        positive_signals=result.positive_signals,
        provider=result.provider,
        model=result.model,
        reviewed_at=when,
    )


@router.get("/status", response_model=ModerationStatus)
def get_status(_: User = Depends(get_current_user)):
    return ModerationStatus(
        enabled=settings.ai_provider.lower() != "disabled",
        provider=settings.ai_provider,
        model=settings.ai_model,
    )


@router.post("/customers/{customer_id}", response_model=ModerationResultRead)
def moderate_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff)),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    snapshot = build_customer_snapshot(db, customer)
    try:
        result = run_moderation(snapshot)
    except AIModerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return _to_read(result, datetime.now(timezone.utc))


@router.post("/loans/{loan_id}", response_model=ModerationResultRead)
def moderate_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff)),
):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    snapshot = build_loan_snapshot(db, loan)
    try:
        result = run_moderation(snapshot)
    except AIModerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    reviewed_at = datetime.now(timezone.utc)
    loan.ai_risk_score = Decimal(str(round(result.risk_score, 2)))
    loan.ai_risk_level = result.risk_level
    loan.ai_recommendation = result.recommendation
    loan.ai_reasoning = result.reasoning
    loan.ai_red_flags = result.red_flags
    loan.ai_positive_signals = result.positive_signals
    loan.ai_provider = result.provider
    loan.ai_model = result.model
    loan.ai_reviewed_at = reviewed_at
    db.commit()

    return _to_read(result, reviewed_at)
