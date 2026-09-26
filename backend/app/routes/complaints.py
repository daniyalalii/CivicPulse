import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.domain import Category, Priority, Status
from app.routes.schemas import (
    ComplaintCreate,
    ComplaintListResponse,
    ComplaintResponse,
    ComplaintStatusUpdate,
    StatsResponse,
)
from app.services import complaints_service

router = APIRouter(prefix="/api", tags=["complaints"])


@router.post(
    "/complaints",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_complaint(
    payload: ComplaintCreate,
    session: AsyncSession = Depends(get_session),
):
    return await complaints_service.create_and_triage_complaint(
        session=session,
        text=payload.text,
        location=payload.location,
        reporter_contact=payload.reporter_contact,
    )


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    return await complaints_service.get_complaint(session, complaint_id)


@router.get("/complaints", response_model=ComplaintListResponse)
async def list_complaints(
    category: Optional[Category] = Query(None),
    priority: Optional[Priority] = Query(None),
    status_filter: Optional[Status] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    items, total = await complaints_service.list_complaints_service(
        session=session,
        category=category,
        priority=priority,
        status=status_filter,
        page=page,
        page_size=page_size,
    )
    return ComplaintListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: uuid.UUID,
    payload: ComplaintStatusUpdate,
    session: AsyncSession = Depends(get_session),
):
    return await complaints_service.update_complaint_status_service(
        session=session,
        complaint_id=complaint_id,
        new_status=payload.status,
    )


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    response.headers["X-Cache"] = "MISS"
    stats = await complaints_service.get_complaint_stats_service(session)
    return StatsResponse(**stats)
