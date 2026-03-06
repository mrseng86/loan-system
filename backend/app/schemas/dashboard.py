from decimal import Decimal

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_loans: int
    overdue_loans: int
    bad_debt_loans: int
    total_disbursed: Decimal
    total_repaid: Decimal
    repayment_rate_percent: Decimal
