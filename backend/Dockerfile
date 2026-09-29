# syntax=docker/dockerfile:1.7

FROM python:3.12-slim@sha256:5bfb5ec7e5d63162f7d31d3624d5f3d67f7df7d537600f192effc2d6dce93b89 AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim@sha256:5bfb5ec7e5d63162f7d31d3624d5f3d67f7df7d537600f192effc2d6dce93b89 AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=builder /usr/local /usr/local
COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic

USER app
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1
