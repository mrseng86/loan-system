from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.loan import LoanStatus


class LoanCreate(BaseModel):
    customer_id: int
    loan_amount: Decimal
    interest_rate: Decimal = Decimal("0")
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
    ai_risk_score: Decimal | None = None
    ai_risk_level: str | None = None
    ai_recommendation: str | None = None
    ai_reasoning: str | None = None
    ai_red_flags: list[str] | None = None
    ai_positive_signals: list[str] | None = None
    ai_provider: str | None = None
    ai_model: str | None = None
    ai_reviewed_at: datetime | None = None
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
    outstanding_amount: Decimal
    closing_balance: Decimal
    cumulative_interest: Decimal
    paid_amount: Decimal
    actual_payment_date: date | None = None
    installment_status: str


class ShortTermLoanSummary(BaseModel):
    id: int
    customer_id: int
    principal_amount: Decimal
    interest_rate: Decimal
    interest_due: Decimal
    total_due: Decimal
    principal_paid: Decimal
    interest_paid: Decimal
    current_balance: Decimal
    disbursed_at: date
    due_date: date
    status: str
    note: str | None = None


class LoanSchedule(BaseModel):
    loan_id: int
    customer_id: int
    customer_name: str
    loan_date: date
    principal_amount: Decimal
    latest_balance: Decimal
    arrears_amount: Decimal
    next_due_amount: Decimal
    tenure_months: int
    opening_total: Decimal
    installment_amount: Decimal
    monthly_interest_rate: Decimal
    service_charge_rate: Decimal
    stamp_duty_rate: Decimal
    periods_paid: int
    periods_remaining: int
    short_term_loans: list[ShortTermLoanSummary]
    rows: list[LoanScheduleRow]
