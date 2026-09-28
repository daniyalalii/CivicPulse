from typing import Union, Any

from fastapi import APIRouter, Depends, Response, status
# from typing import Any  # removed duplicate import

from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session

router = APIRouter(tags=["system"])

# Prometheus Metrics Definition
REQUEST_COUNT = Counter(
    "civicpulse_http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "status_code"],
)
REQUEST_LATENCY = Histogram(
    "civicpulse_http_request_duration_seconds",
    "HTTP Request Latency",
    ["endpoint"],
)
TRIAGE_LATENCY = Histogram(
    "civicpulse_triage_duration_seconds",
    "AI Triage Latency",
    ["provider"],
)
FALLBACK_COUNTER = Counter(
    "civicpulse_triage_fallback_total",
    "Total Fallbacks to Keyword Rules",
)


@router.get("/health", status_code=status.HTTP_200_OK)
async def liveness_health_check() -> dict[str, str]:
    """Liveness probe. MUST NOT touch the database."""
    return {"status": "healthy", "service": "civicpulse-backend"}


@router.get("/ready")
async def readiness_check(session: AsyncSession = Depends(get_session)) -> Union[dict[str, str], Response]:  # noqa: B008
    """Readiness probe. Checks Postgres connection."""
    errors = {}

    try:
        await session.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        errors["postgres"] = str(exc)

    if errors:
        return Response(
            content=f"Dependency failure: {errors}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            media_type="text/plain",
        )

    return {"status": "ready", "database": "connected"}


@router.get("/metrics")
async def get_metrics() -> Response:
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/api/meta/providers")
async def get_provider_meta() -> dict[str, Any]:
    """Observability endpoint surfacing current provider configuration."""
    return {
        "active_provider": settings.triage_provider,
        "groq_model": settings.groq_model,
        "recent_outcomes": [],
    }
