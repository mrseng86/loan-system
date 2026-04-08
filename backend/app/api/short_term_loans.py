from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.customer import Customer
from app.models.short_term_loan import ShortTermLoan, ShortTermRepayment
from app.models.user import User, UserRole
from app.schemas.short_term_loan import (
    ShortTermLoanCreate,
    ShortTermLoanRead,
    ShortTermLoanUpdate,
    ShortTermRepaymentCreate,
    ShortTermRepaymentRead,
    ShortTermRepaymentUpdate,
)
from app.services.short_term_service import quantize_amount, refresh_short_term_status, set_initial_short_term_values, sync_short_term_balance

router = APIRouter(prefix="/short-term-loans", tags=["short-term-loans"])


@router.post("", response_model=ShortTermLoanRead)
def create_short_term_loan(
    payload: ShortTermLoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.staff)),
):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    short_term_loan = ShortTermLoan(
        customer_id=payload.customer_id,
        created_by=current_user.id,
        principal_amount=payload.principal_amount,
        interest_rate=payload.interest_rate,
        interest_due=Decimal("0.00"),
        total_due=Decimal("0.00"),
        principal_paid=Decimal("0.00"),
        interest_paid=Decimal("0.00"),
        current_balance=Decimal("0.00"),
        disbursed_at=payload.disbursed_at,
        due_date=payload.due_date,
        note=payload.note,
    )
    set_initial_short_term_values(short_term_loan)
    db.add(short_term_loan)
    db.commit()
    db.refresh(short_term_loan)
    return short_term_loan


@router.get("", response_model=list[ShortTermLoanRead])
def list_short_term_loans(
    customer_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(ShortTermLoan)
    if customer_id is not None:
        query = query.filter(ShortTermLoan.customer_id == customer_id)
    loans = query.order_by(ShortTermLoan.id.desc()).all()
    for loan in loans:
        refresh_short_term_status(loan, date.today())
    db.commit()
    return loans


@router.put("/{short_term_loan_id}", response_model=ShortTermLoanRead)
def update_short_term_loan(
    short_term_loan_id: int,
    payload: ShortTermLoanUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff)),
):
    short_term_loan = db.query(ShortTermLoan).filter(ShortTermLoan.id == short_term_loan_id).first()
    if not short_term_loan:
        raise HTTPException(status_code=404, detail="Short-term loan not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(short_term_loan, key, value)

    short_term_loan.principal_amount = quantize_amount(short_term_loan.principal_amount)
    short_term_loan.interest_due = quantize_amount(Decimal(short_term_loan.principal_amount) * (Decimal(short_term_loan.interest_rate) / Decimal("100")))
    sync_short_term_balance(short_term_loan)
    db.commit()
    db.refresh(short_term_loan)
    return short_term_loan


@router.delete("/{short_term_loan_id}")
def delete_short_term_loan(
    short_term_loan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff)),
):
    short_term_loan = db.query(ShortTermLoan).filter(ShortTermLoan.id == short_term_loan_id).first()
    if not short_term_loan:
        raise HTTPException(status_code=404, detail="Short-term loan not found")
    db.delete(short_term_loan)
    db.commit()
    return {"message": "Short-term loan deleted"}


@router.get("/repayments", response_model=list[ShortTermRepaymentRead])
def list_short_term_repayments(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(ShortTermRepayment).order_by(ShortTermRepayment.id.desc()).all()


@router.post("/repayments", response_model=ShortTermRepaymentRead)
def create_short_term_repayment(
    payload: ShortTermRepaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    short_term_loan = db.query(ShortTermLoan).filter(ShortTermLoan.id == payload.short_term_loan_id).first()
    if not short_term_loan:
        raise HTTPException(status_code=404, detail="Short-term loan not found")

    amount = quantize_amount(payload.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Repayment amount must be greater than 0")

    repayment = ShortTermRepayment(
        short_term_loan_id=payload.short_term_loan_id,
        recorded_by=current_user.id,
        amount=amount,
        repayment_type=payload.repayment_type,
        method=payload.method,
        note=payload.note,
        paid_at=payload.paid_at,
    )
    db.add(repayment)
    db.flush()
    db.refresh(short_term_loan)
    sync_short_term_balance(short_term_loan)
    db.commit()
    db.refresh(repayment)
    return repayment


@router.put("/repayments/{repayment_id}", response_model=ShortTermRepaymentRead)
def update_short_term_repayment(
    repayment_id: int,
    payload: ShortTermRepaymentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    repayment = db.query(ShortTermRepayment).filter(ShortTermRepayment.id == repayment_id).first()
    if not repayment:
        raise HTTPException(status_code=404, detail="Short-term repayment not found")

    if payload.amount is not None:
        amount = quantize_amount(payload.amount)
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Repayment amount must be greater than 0")
        repayment.amount = amount
    if payload.repayment_type is not None:
        repayment.repayment_type = payload.repayment_type
    if payload.method is not None:
        repayment.method = payload.method
    if payload.note is not None:
        repayment.note = payload.note
    if payload.paid_at is not None:
        repayment.paid_at = payload.paid_at

    short_term_loan = db.query(ShortTermLoan).filter(ShortTermLoan.id == repayment.short_term_loan_id).first()
    if not short_term_loan:
        raise HTTPException(status_code=404, detail="Short-term loan not found")

    db.flush()
    db.refresh(short_term_loan)
    sync_short_term_balance(short_term_loan)
    db.commit()
    db.refresh(repayment)
    return repayment


@router.delete("/repayments/{repayment_id}")
def delete_short_term_repayment(
    repayment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.staff, UserRole.collector)),
):
    repayment = db.query(ShortTermRepayment).filter(ShortTermRepayment.id == repayment_id).first()
    if not repayment:
        raise HTTPException(status_code=404, detail="Short-term repayment not found")

    short_term_loan = db.query(ShortTermLoan).filter(ShortTermLoan.id == repayment.short_term_loan_id).first()
    if not short_term_loan:
        raise HTTPException(status_code=404, detail="Short-term loan not found")

    db.delete(repayment)
    db.flush()
    db.refresh(short_term_loan)
    sync_short_term_balance(short_term_loan)
    db.commit()
    return {"message": "Short-term repayment deleted"}
