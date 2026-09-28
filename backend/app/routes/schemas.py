import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domain import Category, Priority, Status


class ComplaintCreate(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)
    location: str = Field(..., min_length=3, max_length=200)
    reporter_contact: str | None = Field(None, max_length=200)


class ComplaintStatusUpdate(BaseModel):
    status: Status


class ComplaintResponse(BaseModel):
    id: uuid.UUID
    text: str
    location: str
    reporter_contact: str | None = None
    category: Category
    priority: Priority
    status: Status
    ai_summary: str | None = None
    triaged_by: str
    triage_latency_ms: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintListResponse(BaseModel):
    items: list[ComplaintResponse]
    total: int
    page: int
    page_size: int


class StatsResponse(BaseModel):
    by_category: dict[str, int]
    by_priority: dict[str, int]
    by_status: dict[str, int]
    total: int
