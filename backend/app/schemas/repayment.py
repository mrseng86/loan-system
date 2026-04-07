from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class RepaymentCreate(BaseModel):
    loan_id: int
    amount: Decimal
    method: str = "cash"
    note: str | None = None
    paid_at: datetime | None = None


class RepaymentUpdate(BaseModel):
    amount: Decimal | None = None
    method: str | None = None
    note: str | None = None
    paid_at: datetime | None = None


class RepaymentRead(BaseModel):
    id: int
    loan_id: int
    recorded_by: int
    amount: Decimal
    method: str
    note: str | None = None
    paid_at: datetime
    model_config = ConfigDict(from_attributes=True)
