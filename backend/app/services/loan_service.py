from calendar import month_name
from datetime import date, timedelta
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP

from app.models.loan import Loan, LoanStatus
from app.schemas.loan import LoanSchedule, LoanScheduleRow

TWOPLACES = Decimal("0.01")


def quantize_amount(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def round_up_to_next_10(value: Decimal) -> Decimal:
    if value <= 0:
        return Decimal("0.00")
    return ((value / Decimal("10")).quantize(Decimal("1"), rounding=ROUND_CEILING) * Decimal("10")).quantize(
        TWOPLACES,
        rounding=ROUND_HALF_UP,
    )


def add_fixed_monthly_service_fee(value: Decimal, fixed_fee: Decimal = Decimal("10.00")) -> Decimal:
    return quantize_amount(value + fixed_fee)


def calculate_total_payable(loan_amount: Decimal, interest_rate: Decimal) -> Decimal:
    return quantize_amount(loan_amount + (loan_amount * interest_rate / Decimal("100")))


def calculate_installment(total_payable: Decimal, tenure_months: int) -> Decimal:
    if tenure_months <= 0:
        raise ValueError("tenure_months must be greater than 0")
    return quantize_amount(total_payable / Decimal(tenure_months))


def set_initial_loan_values(loan: Loan) -> Loan:
    service_charge_amount = quantize_amount(loan.loan_amount * Decimal(loan.service_charge_rate) / Decimal("100"))
    stamp_duty_amount = quantize_amount(loan.loan_amount * Decimal(loan.stamp_duty_rate) / Decimal("100"))
    financed_amount = quantize_amount(loan.loan_amount + service_charge_amount + stamp_duty_amount)

    monthly_interest_rate = Decimal(loan.monthly_interest_rate)
    monthly_interest_amount = quantize_amount(financed_amount * monthly_interest_rate / Decimal("100"))
    total_interest_amount = quantize_amount(monthly_interest_amount * Decimal(loan.tenure_months))
    raw_total_payable = quantize_amount(financed_amount + total_interest_amount)

    loan.interest_rate = quantize_amount(monthly_interest_rate * Decimal(loan.tenure_months))

    if not loan.installment_amount or loan.installment_amount <= 0:
        raw_installment = quantize_amount(raw_total_payable / Decimal(loan.tenure_months))
        installment_with_fixed_fee = add_fixed_monthly_service_fee(raw_installment)
        loan.installment_amount = round_up_to_next_10(installment_with_fixed_fee)

    loan.total_payable = quantize_amount(loan.installment_amount * Decimal(loan.tenure_months))
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
    service_charge_amount = quantize_amount(Decimal(loan.loan_amount) * Decimal(loan.service_charge_rate) / Decimal("100"))
    stamp_duty_amount = quantize_amount(Decimal(loan.loan_amount) * Decimal(loan.stamp_duty_rate) / Decimal("100"))
    financed_amount = quantize_amount(Decimal(loan.loan_amount) + service_charge_amount + stamp_duty_amount)
    opening_balance = quantize_amount(Decimal(loan.installment_amount) * Decimal(loan.tenure_months))
    installment = quantize_amount(Decimal(loan.installment_amount))
    monthly_interest_rate = Decimal(loan.monthly_interest_rate)
    service_charge_rate = Decimal(loan.service_charge_rate)
    stamp_duty_rate = Decimal(loan.stamp_duty_rate)
    flat_interest_paid = quantize_amount(financed_amount * monthly_interest_rate / Decimal("100"))

    rows: list[LoanScheduleRow] = []
    cumulative_interest = Decimal("0.00")
    running_balance = opening_balance
    today = date.today()

    for period in range(1, loan.tenure_months + 1):
        if running_balance <= 0:
            break

        interest_paid = flat_interest_paid
        service_charge = Decimal("0.00")
        stamp_duty = Decimal("0.00")
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
                outstanding_amount=total_payment,
                closing_balance=closing_balance,
                cumulative_interest=cumulative_interest,
                paid_amount=Decimal("0.00"),
                actual_payment_date=None,
                installment_status="pending",
            )
        )

        running_balance = closing_balance

    repayments = sorted(loan.repayments, key=lambda repayment: repayment.paid_at)
    repayment_index = 0
    remaining_repayment_amount = (
        quantize_amount(Decimal(repayments[0].amount)) if repayments else Decimal("0.00")
    )

    for row in rows:
        due_amount = quantize_amount(Decimal(row.total_payment))
        allocated = Decimal("0.00")
        completed_on = None

        while due_amount > 0 and repayment_index < len(repayments):
            if remaining_repayment_amount <= 0:
                repayment_index += 1
                if repayment_index >= len(repayments):
                    break
                remaining_repayment_amount = quantize_amount(Decimal(repayments[repayment_index].amount))
                continue

            allocation = min(due_amount, remaining_repayment_amount)
            allocated = quantize_amount(allocated + allocation)
            due_amount = quantize_amount(due_amount - allocation)
            remaining_repayment_amount = quantize_amount(remaining_repayment_amount - allocation)

            if due_amount == Decimal("0.00"):
                completed_on = repayments[repayment_index].paid_at.date()

        row.paid_amount = allocated
        row.actual_payment_date = completed_on
        row.outstanding_amount = quantize_amount(max(Decimal("0.00"), Decimal(row.total_payment) - allocated))

        if row.outstanding_amount == Decimal("0.00"):
            row.installment_status = "paid"
        elif row.payment_date < today:
            row.installment_status = "overdue"
        elif allocated > Decimal("0.00"):
            row.installment_status = "partial"
        else:
            row.installment_status = "pending"

    periods_paid = sum(1 for row in rows if row.installment_status == "paid")
    periods_remaining = max(len(rows) - periods_paid, 0)
    arrears_amount = quantize_amount(
        sum((Decimal(row.outstanding_amount) for row in rows if row.payment_date < today and row.outstanding_amount > 0), Decimal("0.00"))
    )

    next_due_amount = Decimal("0.00")
    for row in rows:
        if row.outstanding_amount > 0:
            next_due_amount = quantize_amount(Decimal(row.outstanding_amount))
            break

    return LoanSchedule(
        loan_id=loan.id,
        loan_date=loan.disbursed_at,
        principal_amount=quantize_amount(Decimal(loan.loan_amount)),
        latest_balance=quantize_amount(Decimal(loan.current_balance)),
        arrears_amount=arrears_amount,
        next_due_amount=next_due_amount,
        tenure_months=loan.tenure_months,
        opening_total=opening_balance,
        installment_amount=installment,
        monthly_interest_rate=quantize_amount(monthly_interest_rate),
        service_charge_rate=quantize_amount(service_charge_rate),
        stamp_duty_rate=quantize_amount(stamp_duty_rate),
        periods_paid=periods_paid,
        periods_remaining=periods_remaining,
        rows=rows,
    )
