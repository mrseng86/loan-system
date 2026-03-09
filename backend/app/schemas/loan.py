from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.loan import LoanStatus


class LoanCreate(BaseModel):
    customer_id: int
    loan_amount: Decimal
    interest_rate: Decimal
    monthly_interest_rate: Decimal | None = None
    service_charge_rate: Decimal = Decimal("0")
    stamp_duty_rate: Decimal = Decimal("0")
    tenure_months: int
    installment_amount: Decimal | None = None
    disbursed_at: date


class LoanRead(BaseModel):
    id: int
    customer_id: int
    created_by: int
    loan_amount: Decimal
    interest_rate: Decimal
    monthly_interest_rate: Decimal
    service_charge_rate: Decimal
    stamp_duty_rate: Decimal
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


class LoanScheduleRow(BaseModel):
    period: int
    month: str
    payment_date: date
    opening_balance: Decimal
    principal_paid: Decimal
    interest_paid: Decimal
    service_charge: Decimal
    stamp_duty: Decimal
    total_payment: Decimal
    closing_balance: Decimal
    cumulative_interest: Decimal


class LoanSchedule(BaseModel):
    loan_id: int
    loan_date: date
    tenure_months: int
    opening_total: Decimal
    installment_amount: Decimal
    monthly_interest_rate: Decimal
    service_charge_rate: Decimal
    stamp_duty_rate: Decimal
    rows: list[LoanScheduleRow]
