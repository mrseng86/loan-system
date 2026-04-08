from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.short_term_loan import ShortTermLoanStatus, ShortTermRepaymentType


class ShortTermLoanCreate(BaseModel):
    customer_id: int
    principal_amount: Decimal
    interest_rate: Decimal
    disbursed_at: date
    due_date: date
    note: str | None = None


class ShortTermLoanUpdate(BaseModel):
    principal_amount: Decimal | None = None
    interest_rate: Decimal | None = None
    disbursed_at: date | None = None
    due_date: date | None = None
    note: str | None = None


class ShortTermLoanRead(BaseModel):
    id: int
    customer_id: int
    created_by: int
    principal_amount: Decimal
    interest_rate: Decimal
    interest_due: Decimal
    total_due: Decimal
    principal_paid: Decimal
    interest_paid: Decimal
    current_balance: Decimal
    disbursed_at: date
    due_date: date
    status: ShortTermLoanStatus
    note: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ShortTermRepaymentCreate(BaseModel):
    short_term_loan_id: int
    amount: Decimal
    repayment_type: ShortTermRepaymentType
    method: str = "cash"
    note: str | None = None
    paid_at: datetime | None = None


class ShortTermRepaymentUpdate(BaseModel):
    amount: Decimal | None = None
    repayment_type: ShortTermRepaymentType | None = None
    method: str | None = None
    note: str | None = None
    paid_at: datetime | None = None


class ShortTermRepaymentRead(BaseModel):
    id: int
    short_term_loan_id: int
    recorded_by: int
    amount: Decimal
    repayment_type: ShortTermRepaymentType
    method: str
    note: str | None = None
    paid_at: datetime
    model_config = ConfigDict(from_attributes=True)
