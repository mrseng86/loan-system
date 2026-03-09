from calendar import month_name
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from app.models.loan import Loan, LoanStatus
from app.schemas.loan import LoanSchedule, LoanScheduleRow

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
    if not loan.installment_amount or loan.installment_amount <= 0:
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


def build_loan_schedule(loan: Loan) -> LoanSchedule:
    opening_balance = quantize_amount(Decimal(loan.total_payable))
    installment = quantize_amount(Decimal(loan.installment_amount))
    monthly_interest_rate = Decimal(loan.monthly_interest_rate)
    service_charge_rate = Decimal(loan.service_charge_rate)
    stamp_duty_rate = Decimal(loan.stamp_duty_rate)

    rows: list[LoanScheduleRow] = []
    cumulative_interest = Decimal("0.00")
    running_balance = opening_balance

    for period in range(1, loan.tenure_months + 1):
        if running_balance <= 0:
            break

        interest_paid = quantize_amount(running_balance * monthly_interest_rate / Decimal("100"))
        service_charge = quantize_amount(running_balance * service_charge_rate / Decimal("100"))
        stamp_duty = quantize_amount(running_balance * stamp_duty_rate / Decimal("100"))
        charges = interest_paid + service_charge + stamp_duty

        principal_paid = quantize_amount(installment - charges)
        total_payment = installment

        if principal_paid <= 0:
            principal_paid = Decimal("0.00")

        if principal_paid > running_balance:
            principal_paid = running_balance
            total_payment = quantize_amount(charges + principal_paid)

        closing_balance = quantize_amount(running_balance - principal_paid)
        cumulative_interest = quantize_amount(cumulative_interest + interest_paid)
        payment_date = loan.disbursed_at + timedelta(days=30 * period)

        rows.append(
            LoanScheduleRow(
                period=period,
                month=month_name[payment_date.month],
                payment_date=payment_date,
                opening_balance=running_balance,
                principal_paid=principal_paid,
                interest_paid=interest_paid,
                service_charge=service_charge,
                stamp_duty=stamp_duty,
                total_payment=total_payment,
                closing_balance=closing_balance,
                cumulative_interest=cumulative_interest,
            )
        )

        running_balance = closing_balance

    return LoanSchedule(
        loan_id=loan.id,
        loan_date=loan.disbursed_at,
        tenure_months=loan.tenure_months,
        opening_total=opening_balance,
        installment_amount=installment,
        monthly_interest_rate=quantize_amount(monthly_interest_rate),
        service_charge_rate=quantize_amount(service_charge_rate),
        stamp_duty_rate=quantize_amount(stamp_duty_rate),
        rows=rows,
    )
