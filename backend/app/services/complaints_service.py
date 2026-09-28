import logging
import time
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain import ALLOWED_TRANSITIONS, Category, InvalidTransitionError, Priority, Status
from app.exceptions import ComplaintNotFound
from app.providers.triage.base import TriageProvider, TriageResult
from app.providers.triage.factory import get_triage_provider
from app.providers.triage.rules import RuleBasedTriage
from app.repositories import complaints_repo
from app.repositories.models import Complaint

logger = logging.getLogger("civicpulse.services.complaints")


def validate_status_transition(current_status: Status, new_status: Status) -> None:
    """Validates if transitioning from current_status to new_status is allowed.

    Raises InvalidTransitionError if transition is not in ALLOWED_TRANSITIONS table.
    """
    if current_status == new_status:
        return

    allowed_targets = ALLOWED_TRANSITIONS.get(current_status, set())
    if new_status not in allowed_targets:
        raise InvalidTransitionError(current_status=current_status, new_status=new_status)


async def create_and_triage_complaint(
    session: AsyncSession,
    text: str,
    location: str,
    reporter_contact: str | None = None,
    provider_override: TriageProvider | None = None,
) -> Complaint:
    """Orchestrates complaint triage and persistence.

    Uses configured TriageProvider, falling back to RuleBasedTriage if primary provider fails.
    """
    provider = provider_override or get_triage_provider()
    start_time = time.perf_counter()

    try:
        triage_res: TriageResult = await provider.triage(text, location)
        triaged_by = getattr(provider, "name", "unknown")
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Triage provider '%s' failed for complaint; falling back to rules: %s",
            getattr(provider, "name", "unknown"),
            str(exc),
            extra={
                "provider": getattr(provider, "name", "unknown"),
                "error_class": exc.__class__.__name__,
            },
        )
        fallback_provider = RuleBasedTriage()
        triage_res = await fallback_provider.triage(text, location)
        triaged_by = "rules:fallback"

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    complaint = Complaint(
        id=uuid.uuid4(),
        text=text,
        location=location,
        reporter_contact=reporter_contact,
        category=triage_res.category,
        priority=triage_res.priority,
        status=Status.OPEN,
        ai_summary=triage_res.summary,
        triaged_by=triaged_by,
        triage_latency_ms=latency_ms,
    )

    return await complaints_repo.create_complaint(session, complaint)


async def get_complaint(session: AsyncSession, complaint_id: uuid.UUID) -> Complaint:
    complaint = await complaints_repo.get_complaint_by_id(session, complaint_id)
    if not complaint:
        raise ComplaintNotFound(str(complaint_id))
    return complaint


async def list_complaints_service(
    session: AsyncSession,
    category: Category | None = None,
    priority: Priority | None = None,
    status: Status | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Complaint], int]:
    return await complaints_repo.list_complaints(
        session=session,
        category=category,
        priority=priority,
        status=status,
        page=page,
        page_size=page_size,
    )


async def update_complaint_status_service(
    session: AsyncSession, complaint_id: uuid.UUID, new_status: Status
) -> Complaint:
    complaint = await get_complaint(session, complaint_id)
    validate_status_transition(complaint.status, new_status)
    updated = await complaints_repo.update_complaint_status(session, complaint_id, new_status)
    if not updated:
        raise ComplaintNotFound(str(complaint_id))
    return updated


async def get_complaint_stats_service(session: AsyncSession) -> dict[str, Any]:
    return await complaints_repo.get_complaint_stats(session)
