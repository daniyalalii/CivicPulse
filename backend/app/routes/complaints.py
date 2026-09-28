import uuid

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
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> ComplaintResponse:
    complaint = await complaints_service.create_and_triage_complaint(
        session=session,
        text=payload.text,
        location=payload.location,
        reporter_contact=payload.reporter_contact,
    )
    return ComplaintResponse.from_orm(complaint)


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)  
async def get_complaint(
    complaint_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> ComplaintResponse:
    complaint = await complaints_service.get_complaint(session, complaint_id)
    return ComplaintResponse.from_orm(complaint)


@router.get("/complaints", response_model=ComplaintListResponse) 
async def list_complaints(
    category: Category | None = Query(None),  # noqa: B008
    priority: Priority | None = Query(None),  # noqa: B008
    status_filter: Status | None = Query(None, alias="status"),  # noqa: B008
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> ComplaintListResponse:
    items, total = await complaints_service.list_complaints_service(
        session=session,
        category=category,
        priority=priority,
        status=status_filter,
        page=page,
        page_size=page_size,
    )
    # Convert ORM Complaint models to response schema
    response_items = [ComplaintResponse.from_orm(item) for item in items]
    return ComplaintListResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)  
async def update_complaint_status(
    complaint_id: uuid.UUID,
    payload: ComplaintStatusUpdate,
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> ComplaintResponse:
    complaint = await complaints_service.update_complaint_status_service(
        session=session,
        complaint_id=complaint_id,
        new_status=payload.status,
    )
    return ComplaintResponse.from_orm(complaint)


@router.get("/stats", response_model=StatsResponse)  
async def get_stats(
    response: Response,
    session: AsyncSession = Depends(get_session),  # noqa: B008
) -> StatsResponse:
    response.headers["X-Cache"] = "MISS"
    stats = await complaints_service.get_complaint_stats_service(session)
    return StatsResponse(**stats)
