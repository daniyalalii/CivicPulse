"""
dev_server.py — local dev launcher (no Docker, no PostgreSQL needed)

This script:
1. Creates all SQLAlchemy tables directly in a local SQLite file
   (bypasses Alembic which has postgres-specific migration DDL)
2. Starts uvicorn with --reload

Usage:
    python dev_server.py
"""
import asyncio
import subprocess
import sys

from sqlalchemy.ext.asyncio import create_async_engine

# Must match the DATABASE_URL in .env
DB_URL = "sqlite+aiosqlite:///./civicpulse_dev.db"


async def create_tables() -> None:
    # Import here so app.config picks up .env first
    from app.repositories.models import Base  # noqa: PLC0415

    engine = create_async_engine(DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("[OK] SQLite tables created / verified at civicpulse_dev.db")


if __name__ == "__main__":
    asyncio.run(create_tables())
    print("[START] Starting uvicorn on http://localhost:8000 ...")
    subprocess.run(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
        check=False,
    )
