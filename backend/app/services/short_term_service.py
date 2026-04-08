from datetime import date
from decimal import Decimal, ROUND_CEILING

from app.models.short_term_loan import ShortTermLoan, ShortTermLoanStatus, ShortTermRepaymentType

TWO_PLACES = Decimal("0.01")


def quantize_amount(value: Decimal | int | float | str) -> Decimal:
    return Decimal(str(value)).quantize(TWO_PLACES)


def calculate_short_term_interest(principal_amount: Decimal, interest_rate: Decimal) -> Decimal:
    return quantize_amount(Decimal(principal_amount) * (Decimal(interest_rate) / Decimal("100")))


def refresh_short_term_status(short_term_loan: ShortTermLoan, today: date | None = None) -> ShortTermLoan:
    today = today or date.today()
    if Decimal(short_term_loan.current_balance) <= Decimal("0.00"):
        short_term_loan.current_balance = Decimal("0.00")
        short_term_loan.status = ShortTermLoanStatus.settled
    elif short_term_loan.due_date < today:
        short_term_loan.status = ShortTermLoanStatus.overdue
    else:
        short_term_loan.status = ShortTermLoanStatus.active
    return short_term_loan


def set_initial_short_term_values(short_term_loan: ShortTermLoan) -> ShortTermLoan:
    principal = quantize_amount(short_term_loan.principal_amount)
    interest_due = calculate_short_term_interest(principal, Decimal(short_term_loan.interest_rate))
    short_term_loan.principal_amount = principal
    short_term_loan.interest_due = interest_due
    short_term_loan.total_due = quantize_amount(principal + interest_due)
    short_term_loan.principal_paid = Decimal("0.00")
    short_term_loan.interest_paid = Decimal("0.00")
    short_term_loan.current_balance = short_term_loan.total_due
    return refresh_short_term_status(short_term_loan, short_term_loan.disbursed_at)


def sync_short_term_balance(short_term_loan: ShortTermLoan) -> ShortTermLoan:
    interest_paid = Decimal("0.00")
    principal_paid = Decimal("0.00")

    for repayment in sorted(short_term_loan.repayments, key=lambda item: (item.paid_at, item.id)):
        amount = quantize_amount(repayment.amount)
        if repayment.repayment_type == ShortTermRepaymentType.interest:
            interest_paid += amount
        else:
            principal_paid += amount

    short_term_loan.interest_paid = quantize_amount(min(interest_paid, Decimal(short_term_loan.interest_due)))
    short_term_loan.principal_paid = quantize_amount(min(principal_paid, Decimal(short_term_loan.principal_amount)))
    short_term_loan.total_due = quantize_amount(Decimal(short_term_loan.principal_amount) + Decimal(short_term_loan.interest_due))
    short_term_loan.current_balance = quantize_amount(
        max(Decimal(short_term_loan.interest_due) - Decimal(short_term_loan.interest_paid), Decimal("0.00"))
        + max(Decimal(short_term_loan.principal_amount) - Decimal(short_term_loan.principal_paid), Decimal("0.00"))
    )
    return refresh_short_term_status(short_term_loan)
