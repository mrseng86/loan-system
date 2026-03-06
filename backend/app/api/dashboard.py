from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.loan import Loan, LoanStatus
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_loans = db.query(func.count(Loan.id)).scalar() or 0
    overdue_loans = db.query(func.count(Loan.id)).filter(Loan.status == LoanStatus.overdue).scalar() or 0
    bad_debt_loans = db.query(func.count(Loan.id)).filter(Loan.status == LoanStatus.bad_debt).scalar() or 0

    total_disbursed = Decimal(db.query(func.coalesce(func.sum(Loan.loan_amount), 0)).scalar() or 0)
    total_repaid = Decimal(db.query(func.coalesce(func.sum(Loan.total_paid), 0)).scalar() or 0)

    repayment_rate = Decimal("0")
    if total_disbursed > 0:
        repayment_rate = (total_repaid / total_disbursed) * Decimal("100")

    return DashboardStats(
        total_loans=total_loans,
        overdue_loans=overdue_loans,
        bad_debt_loans=bad_debt_loans,
        total_disbursed=total_disbursed.quantize(Decimal("0.01")),
        total_repaid=total_repaid.quantize(Decimal("0.01")),
        repayment_rate_percent=repayment_rate.quantize(Decimal("0.01")),
    )
