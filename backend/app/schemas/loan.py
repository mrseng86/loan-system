from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.loan import LoanStatus


class LoanCreate(BaseModel):
    customer_id: int
    loan_amount: Decimal
    interest_rate: Decimal
    tenure_months: int
    disbursed_at: date


class LoanRead(BaseModel):
    id: int
    customer_id: int
    created_by: int
    loan_amount: Decimal
    interest_rate: Decimal
    tenure_months: int
    installment_amount: Decimal
    total_payable: Decimal
    total_paid: Decimal
    current_balance: Decimal
    disbursed_at: date
    next_due_date: date
    status: LoanStatus
    days_overdue: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class LoanListItem(LoanRead):
    customer_name: str
