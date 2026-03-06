from datetime import date
from decimal import Decimal

from app.models.loan import Loan, LoanStatus
from app.services.loan_service import calculate_installment, calculate_total_payable, refresh_overdue_status


def test_calculation_helpers():
    total = calculate_total_payable(Decimal("1000.00"), Decimal("10.00"))
    installment = calculate_installment(total, 11)
    assert total == Decimal("1100.00")
    assert installment == Decimal("100.00")


def test_refresh_overdue_status_marks_overdue():
    loan = Loan(
        customer_id=1,
        created_by=1,
        loan_amount=Decimal("1000.00"),
        interest_rate=Decimal("10.00"),
        tenure_months=10,
        installment_amount=Decimal("110.00"),
        total_payable=Decimal("1100.00"),
        total_paid=Decimal("0.00"),
        current_balance=Decimal("1100.00"),
        disbursed_at=date(2026, 1, 1),
        next_due_date=date(2026, 1, 15),
        status=LoanStatus.active,
        days_overdue=0,
    )

    refresh_overdue_status(loan, date(2026, 2, 1))
    assert loan.status == LoanStatus.overdue
    assert loan.days_overdue == 17
