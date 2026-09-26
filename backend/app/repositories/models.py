import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Index, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.domain import Category, Priority, Status


class Base(DeclarativeBase):
    pass


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    reporter_contact: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    category: Mapped[Category] = mapped_column(
        SQLEnum(Category, name="category_enum"), nullable=False
    )
    priority: Mapped[Priority] = mapped_column(
        SQLEnum(Priority, name="priority_enum"), nullable=False
    )
    status: Mapped[Status] = mapped_column(
        SQLEnum(Status, name="status_enum"), nullable=False, default=Status.OPEN
    )
    ai_summary: Mapped[Optional[str]] = mapped_column(String(140), nullable=True)
    triaged_by: Mapped[str] = mapped_column(String(50), nullable=False)
    triage_latency_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("idx_complaints_status_priority", "status", "priority"),
    )
