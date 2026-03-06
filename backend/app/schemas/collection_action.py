from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.collection_action import CollectionActionType


class CollectionActionCreate(BaseModel):
    loan_id: int
    action_type: CollectionActionType
    notes: str | None = None


class CollectionActionRead(BaseModel):
    id: int
    loan_id: int
    staff_id: int
    action_type: CollectionActionType
    notes: str | None = None
    action_at: datetime
    model_config = ConfigDict(from_attributes=True)
