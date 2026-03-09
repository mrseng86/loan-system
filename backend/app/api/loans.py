from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.customer import Customer
from app.models.loan import Loan, LoanStatus
from app.models.user import User, UserRole
from app.schemas.loan import LoanCreate, LoanRead, LoanSchedule
from app.services.loan_service import build_loan_schedule, refresh_overdue_status, set_initial_loan_values

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post("", response_model=LoanRead)
def create_loan(
    payload: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.staff)),
):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    loan = Loan(
        customer_id=payload.customer_id,
        created_by=current_user.id,
        loan_amount=payload.loan_amount,
        interest_rate=payload.interest_rate,
        monthly_interest_rate=payload.monthly_interest_rate
        if payload.monthly_interest_rate is not None
        else (payload.interest_rate / Decimal(payload.tenure_months)),
        service_charge_rate=payload.service_charge_rate,
        stamp_duty_rate=payload.stamp_duty_rate,
        tenure_months=payload.tenure_months,
        installment_amount=payload.installment_amount or Decimal("0.00"),
        total_payable=Decimal("0.00"),
        total_paid=Decimal("0.00"),
        current_balance=Decimal("0.00"),
        disbursed_at=payload.disbursed_at,
        next_due_date=payload.disbursed_at,
        status=LoanStatus.active,
        days_overdue=0,
    )
    set_initial_loan_values(loan)

    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("", response_model=list[LoanRead])
def list_loans(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    loans = db.query(Loan).order_by(Loan.id.desc()).all()
    today = date.today()
    for loan in loans:
        refresh_overdue_status(loan, today)
    db.commit()
    return loans


@router.get("/{loan_id}", response_model=LoanRead)
def get_loan(loan_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    refresh_overdue_status(loan, date.today())
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/{loan_id}/schedule", response_model=LoanSchedule)
def get_loan_schedule(loan_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return build_loan_schedule(loan)
