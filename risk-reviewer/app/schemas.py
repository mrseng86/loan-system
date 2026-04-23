from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ReviewRead(BaseModel):
    id: int
    subject_name: str | None
    original_filename: str
    content_type: str
    file_size_bytes: int
    document_type: str | None
    risk_score: Decimal | None
    risk_level: str | None
    recommendation: str | None
    reasoning: str | None
    key_findings: list[str] | None
    red_flags: list[str] | None
    positive_signals: list[str] | None
    provider: str | None
    model: str | None
    error_message: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewSummary(BaseModel):
    id: int
    subject_name: str | None
    original_filename: str
    document_type: str | None
    risk_score: Decimal | None
    risk_level: str | None
    recommendation: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthStatus(BaseModel):
    ollama_reachable: bool
    text_model: str
    vision_model: str
    text_model_pulled: bool
    vision_model_pulled: bool
    base_url: str
    message: str | None = None
