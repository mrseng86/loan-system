from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from app.models.loan import Loan, LoanStatus

TWOPLACES = Decimal("0.01")


def quantize_amount(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def calculate_total_payable(loan_amount: Decimal, interest_rate: Decimal) -> Decimal:
    return quantize_amount(loan_amount + (loan_amount * interest_rate / Decimal("100")))


def calculate_installment(total_payable: Decimal, tenure_months: int) -> Decimal:
    if tenure_months <= 0:
        raise ValueError("tenure_months must be greater than 0")
    return quantize_amount(total_payable / Decimal(tenure_months))


def set_initial_loan_values(loan: Loan) -> Loan:
    loan.total_payable = calculate_total_payable(loan.loan_amount, loan.interest_rate)
    loan.installment_amount = calculate_installment(loan.total_payable, loan.tenure_months)
    loan.total_paid = Decimal("0.00")
    loan.current_balance = loan.total_payable
    loan.next_due_date = loan.disbursed_at + timedelta(days=30)
    loan.status = LoanStatus.active
    loan.days_overdue = 0
    return loan


def refresh_overdue_status(loan: Loan, today: date | None = None) -> Loan:
    if today is None:
        today = date.today()

    if loan.status in {LoanStatus.closed, LoanStatus.bad_debt}:
        loan.days_overdue = 0
        return loan

    if loan.current_balance <= 0:
        loan.status = LoanStatus.closed
        loan.days_overdue = 0
        return loan

    if loan.next_due_date < today:
        loan.status = LoanStatus.overdue
        loan.days_overdue = (today - loan.next_due_date).days
    else:
        loan.status = LoanStatus.active
        loan.days_overdue = 0
    return loan
