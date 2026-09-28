import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.domain import Category, Priority, Status


class ComplaintCreate(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)
    location: str = Field(..., min_length=3, max_length=200)
    reporter_contact: Optional[str] = Field(None, max_length=200)


class ComplaintStatusUpdate(BaseModel):
    status: Status


class ComplaintResponse(BaseModel):
    id: uuid.UUID
    text: str
    location: str
    reporter_contact: Optional[str] = None
    category: Category
    priority: Priority
    status: Status
    ai_summary: Optional[str] = None
    triaged_by: str
    triage_latency_ms: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintListResponse(BaseModel):
    items: List[ComplaintResponse]
    total: int
    page: int
    page_size: int


class StatsResponse(BaseModel):
    by_category: Dict[str, int]
    by_priority: Dict[str, int]
    by_status: Dict[str, int]
    total: int
