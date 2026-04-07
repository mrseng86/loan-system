from pydantic import BaseModel, Field


class PerkesoQueryRequest(BaseModel):
    national_id: str = Field(min_length=12, max_length=12, pattern=r"^\d{12}$")
    legacy_id: str = ""


class PerkesoEmploymentRecord(BaseModel):
    company: str
    start_month: str
    paid_contribution_count: int
    last_contribution_month: str
    estimated_last_working_day: str
    estimated_loe: str


class PerkesoQueryResponse(BaseModel):
    national_id: str
    customer_name: str
    records: list[PerkesoEmploymentRecord]
