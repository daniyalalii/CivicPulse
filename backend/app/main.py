from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine
from app.domain import InvalidTransitionError
from app.exceptions import ComplaintNotFound, RateLimited
from app.routes import complaints, system


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup phase
    yield
    # Graceful shutdown: dispose of DB engine pool connections on SIGTERM
    await engine.dispose()


app = FastAPI(
    title="CivicPulse Backend",
    description="Municipal Complaint Triage Platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(InvalidTransitionError)  # type: ignore[misc]
async def invalid_transition_handler(request: Request, exc: InvalidTransitionError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc), "error": "InvalidStatusTransition"},
    )


@app.exception_handler(ComplaintNotFound)  # type: ignore[misc]
async def complaint_not_found_handler(request: Request, exc: ComplaintNotFound) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc), "error": "ComplaintNotFound"},
    )


@app.exception_handler(RateLimited)  # type: ignore[misc]
async def rate_limited_handler(request: Request, exc: RateLimited) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": str(exc), "error": "RateLimited"},
        headers={"Retry-After": str(exc.retry_after)},
    )


app.include_router(system.router)
app.include_router(complaints.router)
