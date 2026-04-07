from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.loan import Loan, LoanStatus
from app.models.repayment import Repayment
from app.models.user import User, UserRole
from app.schemas.repayment import RepaymentCreate, RepaymentRead, RepaymentUpdate
from app.services.loan_service import quantize_amount, refresh_overdue_status

router = APIRouter(prefix="/repayments", tags=["repayments"])


def sync_loan_balance(loan: Loan, db: Session) -> Loan:
    repayments = db.query(Repayment).filter(Repayment.loan_id == loan.id).all()
    loan.total_paid = quantize_amount(
        sum((Decimal(repayment.amount) for repayment in repayments), Decimal("0.00"))
    )
    loan.current_balance = quantize_amount(Decimal(loan.total_payable) - Decimal(loan.total_paid))

    if loan.current_balance <= 0:
        loan.current_balance = Decimal("0.00")
        loan.status = LoanStatus.closed
        loan.days_overdue = 0
    else:
        refresh_overdue_status(loan, date.today())

    return loan


@router.post("", response_model=RepaymentRead)
def record_repayment(
    payload: RepaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    loan = db.query(Loan).filter(Loan.id == payload.loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    amount = quantize_amount(payload.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Repayment amount must be greater than 0")

    repayment = Repayment(
        loan_id=payload.loan_id,
        recorded_by=current_user.id,
        amount=amount,
        method=payload.method,
        note=payload.note,
        paid_at=payload.paid_at,
    )
    db.add(repayment)
    db.flush()
    sync_loan_balance(loan, db)

    db.commit()
    db.refresh(repayment)
    return repayment


@router.put("/{repayment_id}", response_model=RepaymentRead)
def update_repayment(
    repayment_id: int,
    payload: RepaymentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    repayment = db.query(Repayment).filter(Repayment.id == repayment_id).first()
    if not repayment:
        raise HTTPException(status_code=404, detail="Repayment not found")

    if payload.amount is not None:
        amount = quantize_amount(payload.amount)
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Repayment amount must be greater than 0")
        repayment.amount = amount

    if payload.method is not None:
        repayment.method = payload.method

    if payload.note is not None:
        repayment.note = payload.note

    if payload.paid_at is not None:
        repayment.paid_at = payload.paid_at

    loan = db.query(Loan).filter(Loan.id == repayment.loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    db.flush()
    sync_loan_balance(loan, db)
    db.commit()
    db.refresh(repayment)
    return repayment


@router.delete("/{repayment_id}")
def delete_repayment(
    repayment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    repayment = db.query(Repayment).filter(Repayment.id == repayment_id).first()
    if not repayment:
        raise HTTPException(status_code=404, detail="Repayment not found")

    loan = db.query(Loan).filter(Loan.id == repayment.loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    db.delete(repayment)
    db.flush()
    sync_loan_balance(loan, db)
    db.commit()
    return {"message": "Repayment deleted"}


@router.get("", response_model=list[RepaymentRead])
def list_repayments(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Repayment).order_by(Repayment.id.desc()).all()
