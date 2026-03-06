import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class CollectionActionType(str, enum.Enum):
    call = "call"
    whatsapp = "whatsapp"
    visit = "visit"
    legal_notice = "legal_notice"


class CollectionAction(Base):
    __tablename__ = "collection_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    loan_id: Mapped[int] = mapped_column(ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action_type: Mapped[CollectionActionType] = mapped_column(Enum(CollectionActionType), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    loan = relationship("Loan", back_populates="collection_actions")
