import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ShortTermLoanStatus(str, enum.Enum):
    active = "active"
    overdue = "overdue"
    settled = "settled"


class ShortTermRepaymentType(str, enum.Enum):
    interest = "interest"
    principal = "principal"


class ShortTermLoan(Base):
    __tablename__ = "short_term_loans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    principal_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    interest_rate: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)
    interest_due: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_due: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    principal_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    interest_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    current_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    disbursed_at: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[ShortTermLoanStatus] = mapped_column(Enum(ShortTermLoanStatus), nullable=False, default=ShortTermLoanStatus.active)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    customer = relationship("Customer", back_populates="short_term_loans")
    repayments = relationship("ShortTermRepayment", back_populates="short_term_loan", cascade="all, delete-orphan")


class ShortTermRepayment(Base):
    __tablename__ = "short_term_repayments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    short_term_loan_id: Mapped[int] = mapped_column(ForeignKey("short_term_loans.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    repayment_type: Mapped[ShortTermRepaymentType] = mapped_column(Enum(ShortTermRepaymentType), nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False, default="cash")
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    short_term_loan = relationship("ShortTermLoan", back_populates="repayments")
