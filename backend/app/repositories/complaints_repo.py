import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain import Category, Priority, Status
from app.repositories.models import Complaint


async def create_complaint(session: AsyncSession, complaint: Complaint) -> Complaint:
    """Persists a new complaint entity."""
    session.add(complaint)
    await session.commit()
    await session.refresh(complaint)
    return complaint


async def get_complaint_by_id(
    session: AsyncSession, complaint_id: uuid.UUID
) -> Optional[Complaint]:
    """Fetches a complaint by its primary key ID."""
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def list_complaints(
    session: AsyncSession,
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
    status: Optional[Status] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Complaint], int]:
    """Lists complaints with pagination and filtering, returning (items, total_count)."""
    stmt = select(Complaint)
    if category is not None:
        stmt = stmt.where(Complaint.category == category)
    if priority is not None:
        stmt = stmt.where(Complaint.priority == priority)
    if status is not None:
        stmt = stmt.where(Complaint.status == status)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await session.execute(count_stmt)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    stmt = stmt.order_by(Complaint.created_at.desc()).offset(offset).limit(page_size)
    result = await session.execute(stmt)
    items = list(result.scalars().all())

    return items, total


async def update_complaint_status(
    session: AsyncSession, complaint_id: uuid.UUID, new_status: Status
) -> Optional[Complaint]:
    """Updates the status of an existing complaint."""
    complaint = await get_complaint_by_id(session, complaint_id)
    if not complaint:
        return None

    complaint.status = new_status
    complaint.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(complaint)
    return complaint


async def get_complaint_stats(session: AsyncSession) -> Dict[str, Any]:
    """Computes aggregate metrics by category, priority, and status."""
    cat_stmt = select(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category)
    prio_stmt = select(Complaint.priority, func.count(Complaint.id)).group_by(Complaint.priority)
    stat_stmt = select(Complaint.status, func.count(Complaint.id)).group_by(Complaint.status)

    cat_rows = (await session.execute(cat_stmt)).all()
    prio_rows = (await session.execute(prio_stmt)).all()
    stat_rows = (await session.execute(stat_stmt)).all()

    by_category = {c.value if hasattr(c, "value") else str(c): count for c, count in cat_rows}
    by_priority = {p.value if hasattr(p, "value") else str(p): count for p, count in prio_rows}
    by_status = {s.value if hasattr(s, "value") else str(s): count for s, count in stat_rows}

    total = sum(by_status.values())

    return {
        "by_category": by_category,
        "by_priority": by_priority,
        "by_status": by_status,
        "total": total,
    }
