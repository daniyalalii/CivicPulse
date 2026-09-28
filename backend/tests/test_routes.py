import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.database import get_session
from app.domain import Category, Priority, Status
from app.main import app
from app.repositories.models import Complaint


async def mock_get_session():
    mock_session = AsyncMock()
    mock_session.execute.return_value = AsyncMock()
    yield mock_session


@pytest.fixture(autouse=True)
def override_dependencies():
    app.dependency_overrides[get_session] = mock_get_session
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_ready_endpoint_success():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/ready")
        assert response.status_code == 200
        assert response.json()["status"] == "ready"


@pytest.mark.asyncio
async def test_metrics_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/metrics")
        assert response.status_code == 200
        assert "civicpulse_http_requests_total" in response.text


@pytest.mark.asyncio
async def test_meta_providers_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/meta/providers")
        assert response.status_code == 200
        assert "active_provider" in response.json()


@pytest.mark.asyncio
async def test_create_complaint_route():
    fake_complaint = Complaint(
        id=uuid.uuid4(),
        text="Water main line burst near G-9 markaz masjid since fajr time.",
        location="Sector G-9 Markaz, Islamabad",
        reporter_contact="0300-1234567",
        category=Category.WATER,
        priority=Priority.HIGH,
        status=Status.OPEN,
        ai_summary="Burst water main in G-9 Markaz",
        triaged_by="simulated",
        triage_latency_ms=15,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        with patch(
            "app.services.complaints_service.create_and_triage_complaint",
            return_value=fake_complaint,
        ):
            payload = {
                "text": "Water main line burst near G-9 markaz masjid since fajr time.",
                "location": "Sector G-9 Markaz, Islamabad",
                "reporter_contact": "0300-1234567",
            }
            response = await client.post("/api/complaints", json=payload)
            assert response.status_code == 201
            data = response.json()
            assert data["category"] == "water"
            assert data["priority"] == "high"


@pytest.mark.asyncio
async def test_invalid_status_transition_route_returns_409():
    fake_complaint = Complaint(
        id=uuid.uuid4(),
        text="Transformer spark in F-10/2",
        location="Sector F-10/2",
        category=Category.ELECTRICITY,
        priority=Priority.HIGH,
        status=Status.RESOLVED,  # Terminal state
        triaged_by="simulated",
        triage_latency_ms=10,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        with patch(
            "app.services.complaints_service.get_complaint",
            return_value=fake_complaint,
        ):
            response = await client.patch(
                f"/api/complaints/{fake_complaint.id}/status",
                json={"status": "open"},
            )
            assert response.status_code == 409
            assert "Cannot transition status" in response.json()["detail"]
