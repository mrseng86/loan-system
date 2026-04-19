from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ModerationResultRead(BaseModel):
    risk_score: Decimal
    risk_level: str
    recommendation: str
    reasoning: str
    red_flags: list[str]
    positive_signals: list[str]
    provider: str
    model: str
    reviewed_at: datetime


class ModerationStatus(BaseModel):
    enabled: bool
    provider: str
    model: str
