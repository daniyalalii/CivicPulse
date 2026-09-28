import uuid
from unittest.mock import AsyncMock, patch

import pytest

from app.domain import Category, Priority, Status
from app.exceptions import ComplaintNotFound
from app.repositories.models import Complaint
from app.services import complaints_service


@pytest.mark.asyncio
async def test_get_complaint_found():
    fake_complaint = Complaint(
        id=uuid.uuid4(),
        text="Sample complaint text",
        location="Sample location",
        category=Category.WATER,
        priority=Priority.NORMAL,
        status=Status.OPEN,
        triaged_by="simulated",
        triage_latency_ms=10,
    )
    mock_session = AsyncMock()

    with patch("app.repositories.complaints_repo.get_complaint_by_id", return_value=fake_complaint):
        res = await complaints_service.get_complaint(mock_session, fake_complaint.id)
        assert res.id == fake_complaint.id


@pytest.mark.asyncio
async def test_get_complaint_not_found():
    mock_session = AsyncMock()
    fake_id = uuid.uuid4()

    with patch("app.repositories.complaints_repo.get_complaint_by_id", return_value=None), pytest.raises(ComplaintNotFound):  # noqa: SIM117
        await complaints_service.get_complaint(mock_session, fake_id)


@pytest.mark.asyncio
async def test_list_complaints_service():
    mock_session = AsyncMock()
    fake_complaints = [
        Complaint(
            id=uuid.uuid4(),
            text="Text 1",
            location="Loc 1",
            category=Category.ROADS,
            priority=Priority.NORMAL,
            status=Status.OPEN,
            triaged_by="simulated",
            triage_latency_ms=5,
        )
    ]

    with patch("app.repositories.complaints_repo.list_complaints", return_value=(fake_complaints, 1)):
        items, total = await complaints_service.list_complaints_service(mock_session, page=1, page_size=20)
        assert len(items) == 1
        assert total == 1


@pytest.mark.asyncio
async def test_update_complaint_status_service_success():
    fake_id = uuid.uuid4()
    old_complaint = Complaint(
        id=fake_id,
        text="Complaint text",
        location="Location",
        category=Category.SANITATION,
        priority=Priority.HIGH,
        status=Status.OPEN,
        triaged_by="simulated",
        triage_latency_ms=8,
    )
    updated_complaint = Complaint(
        id=fake_id,
        text="Complaint text",
        location="Location",
        category=Category.SANITATION,
        priority=Priority.HIGH,
        status=Status.IN_PROGRESS,
        triaged_by="simulated",
        triage_latency_ms=8,
    )
    mock_session = AsyncMock()

    with patch("app.repositories.complaints_repo.get_complaint_by_id", return_value=old_complaint):
        with patch("app.repositories.complaints_repo.update_complaint_status", return_value=updated_complaint):
            res = await complaints_service.update_complaint_status_service(
                mock_session, fake_id, Status.IN_PROGRESS
            )
            assert res.status == Status.IN_PROGRESS


@pytest.mark.asyncio
async def test_get_complaint_stats_service():
    mock_session = AsyncMock()
    fake_stats = {
        "by_category": {"water": 5},
        "by_priority": {"high": 5},
        "by_status": {"open": 5},
        "total": 5,
    }

    with patch("app.repositories.complaints_repo.get_complaint_stats", return_value=fake_stats):
        res = await complaints_service.get_complaint_stats_service(mock_session)
        assert res["total"] == 5
