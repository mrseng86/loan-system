import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import JSON, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class LoanStatus(str, enum.Enum):
    active = "active"
    overdue = "overdue"
    closed = "closed"
    bad_debt = "bad_debt"


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    loan_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    interest_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    monthly_interest_rate: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False, default=0)
    service_charge_rate: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False, default=0)
    stamp_duty_rate: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False, default=0)
    tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    installment_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    total_payable: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    current_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    disbursed_at: Mapped[date] = mapped_column(Date, nullable=False)
    next_due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[LoanStatus] = mapped_column(Enum(LoanStatus), nullable=False, default=LoanStatus.active)
    days_overdue: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    ai_risk_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    ai_risk_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ai_recommendation: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_red_flags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    ai_positive_signals: Mapped[list | None] = mapped_column(JSON, nullable=True)
    ai_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ai_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ai_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    customer = relationship("Customer", back_populates="loans")
    repayments = relationship("Repayment", back_populates="loan", cascade="all, delete-orphan")
    collection_actions = relationship("CollectionAction", back_populates="loan", cascade="all, delete-orphan")
