import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.domain import Category, Priority, Status
from app.repositories import complaints_repo
from app.repositories.models import Complaint


@pytest.mark.asyncio
async def test_repo_create_and_get():
    fake_id = uuid.uuid4()
    complaint = Complaint(
        id=fake_id,
        text="Test complaint text for repository",
        location="Test location",
        category=Category.WATER,
        priority=Priority.HIGH,
        status=Status.OPEN,
        triaged_by="simulated",
        triage_latency_ms=12,
    )

    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    created = await complaints_repo.create_complaint(mock_session, complaint)
    assert created.id == fake_id

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = complaint
    mock_session.execute.return_value = mock_result

    fetched = await complaints_repo.get_complaint_by_id(mock_session, fake_id)
    assert fetched is not None
    assert fetched.id == fake_id


@pytest.mark.asyncio
async def test_repo_list_complaints():
    mock_session = AsyncMock()
    mock_count_result = MagicMock()
    mock_count_result.scalar_one.return_value = 1

    mock_items_result = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [
        Complaint(
            id=uuid.uuid4(),
            text="Text",
            location="Loc",
            category=Category.ROADS,
            priority=Priority.NORMAL,
            status=Status.OPEN,
            triaged_by="simulated",
            triage_latency_ms=10,
        )
    ]
    mock_items_result.scalars.return_value = mock_scalars

    mock_session.execute.side_effect = [mock_count_result, mock_items_result]

    items, total = await complaints_repo.list_complaints(
        mock_session, category=Category.ROADS, priority=Priority.NORMAL, status=Status.OPEN, page=1, page_size=20
    )
    assert total == 1
    assert len(items) == 1


@pytest.mark.asyncio
async def test_repo_update_status():
    fake_id = uuid.uuid4()
    complaint = Complaint(
        id=fake_id,
        text="Text",
        location="Loc",
        category=Category.WATER,
        priority=Priority.HIGH,
        status=Status.OPEN,
        triaged_by="simulated",
        triage_latency_ms=10,
    )

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = complaint
    mock_session.execute.return_value = mock_result

    updated = await complaints_repo.update_complaint_status(mock_session, fake_id, Status.IN_PROGRESS)
    assert updated is not None
    assert updated.status == Status.IN_PROGRESS


@pytest.mark.asyncio
async def test_repo_stats():
    mock_session = AsyncMock()

    mock_cat_res = MagicMock()
    mock_cat_res.all.return_value = [(Category.WATER, 2)]

    mock_prio_res = MagicMock()
    mock_prio_res.all.return_value = [(Priority.HIGH, 2)]

    mock_stat_res = MagicMock()
    mock_stat_res.all.return_value = [(Status.OPEN, 2)]

    mock_session.execute.side_effect = [mock_cat_res, mock_prio_res, mock_stat_res]

    stats = await complaints_repo.get_complaint_stats(mock_session)
    assert stats["total"] == 2
    assert stats["by_category"]["water"] == 2
