from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Repayment(Base):
    __tablename__ = "repayments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    loan_id: Mapped[int] = mapped_column(ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False, default="cash")
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    loan = relationship("Loan", back_populates="repayments")
