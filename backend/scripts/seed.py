from datetime import date
from decimal import Decimal

from app.core.security import get_password_hash
from app.db.session import Base, SessionLocal, engine
from app.models.customer import Customer
from app.models.loan import Loan
from app.models.user import User, UserRole
from app.services.loan_service import refresh_overdue_status, set_initial_loan_values


def get_or_create_user(db, email: str, role: UserRole, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(email=email, role=role, hashed_password=get_password_hash(password))
    db.add(user)
    db.flush()
    return user


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = get_or_create_user(db, "admin@lms.com", UserRole.admin, "admin123")
        staff = get_or_create_user(db, "staff@lms.com", UserRole.staff, "staff123")
        collector = get_or_create_user(db, "collector@lms.com", UserRole.collector, "collector123")

        if not db.query(Customer).count():
            c1 = Customer(full_name="John Carter", email="john@example.com", phone="+155501001", address="New York", national_id="NY001")
            c2 = Customer(full_name="Aisha Khan", email="aisha@example.com", phone="+155501002", address="Chicago", national_id="CH002")
            db.add_all([c1, c2])
            db.flush()

            loan1 = Loan(
                customer_id=c1.id,
                created_by=staff.id,
                loan_amount=Decimal("10000.00"),
                interest_rate=Decimal("12.00"),
                tenure_months=12,
                installment_amount=Decimal("0.00"),
                total_payable=Decimal("0.00"),
                total_paid=Decimal("0.00"),
                current_balance=Decimal("0.00"),
                disbursed_at=date(2025, 12, 1),
                next_due_date=date(2025, 12, 1),
            )
            set_initial_loan_values(loan1)
            refresh_overdue_status(loan1)

            loan2 = Loan(
                customer_id=c2.id,
                created_by=admin.id,
                loan_amount=Decimal("5000.00"),
                interest_rate=Decimal("8.00"),
                tenure_months=10,
                installment_amount=Decimal("0.00"),
                total_payable=Decimal("0.00"),
                total_paid=Decimal("0.00"),
                current_balance=Decimal("0.00"),
                disbursed_at=date(2026, 2, 1),
                next_due_date=date(2026, 2, 1),
            )
            set_initial_loan_values(loan2)

            db.add_all([loan1, loan2])
            db.flush()

        db.commit()
        print("Seed completed.")
        print("Users: admin@lms.com/admin123, staff@lms.com/staff123, collector@lms.com/collector123")
    finally:
        db.close()


if __name__ == "__main__":
    main()

