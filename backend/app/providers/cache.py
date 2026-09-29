import asyncio
import hashlib
import json
from typing import Any, Self, cast

from fastapi import Request
from redis import asyncio as redis_asyncio
from redis.exceptions import RedisError

from app.config import settings
from app.exceptions import RateLimited


class RedisCache:
    """Lightweight Redis-backed helper for rate limits and short-lived cache entries."""

    _instance: "RedisCache | None" = None

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = cast("RedisCache | None", super().__new__(cls))
        return cast(Self, cls._instance)

    def __init__(self) -> None:
        self._client: redis_asyncio.Redis | None = getattr(self, "_client", None)
        self._loop_id: int | None = getattr(self, "_loop_id", None)
        self._ensure_client()

    def _ensure_client(self) -> redis_asyncio.Redis:
        try:
            loop = asyncio.get_running_loop()
            loop_id = id(loop)
        except RuntimeError:
            loop_id = None

        client = self._client
        if client is None or self._loop_id != loop_id:
            client = redis_asyncio.Redis.from_url(
                settings.redis_url,
                decode_responses=True,
            )
            self._client = client
            self._loop_id = loop_id

        assert client is not None
        return client

    async def ping(self) -> bool:
        client = self._ensure_client()
        try:
            return bool(await client.ping())
        except (RedisError, RuntimeError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return False

    async def get_json(self, key: str) -> Any | None:
        client = self._ensure_client()
        if not await self.ping():
            return None
        try:
            raw_value = await client.get(key)
        except (RedisError, RuntimeError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return None
        if raw_value is None:
            return None
        try:
            return json.loads(raw_value)
        except (TypeError, ValueError):
            return None

    async def set_json(self, key: str, value: Any, ttl_seconds: int) -> bool:
        client = self._ensure_client()
        if not await self.ping():
            return False
        try:
            payload = json.dumps(value, separators=(",", ":"), default=str)
            await client.set(key, payload, ex=ttl_seconds)
            return True
        except (RedisError, RuntimeError, TimeoutError, TypeError, ValueError):  # pragma: no cover - infrastructure dependent
            return False

    async def delete(self, key: str) -> bool:
        client = self._ensure_client()
        if not await self.ping():
            return False
        try:
            await client.delete(key)
            return True
        except (RedisError, RuntimeError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return False

    async def rate_limit(self, client_ip: str, limit: int = 10, window_seconds: int = 60) -> None:
        """Reject clients who exceed the configured request quota for a sliding minute."""
        client = self._ensure_client()
        if not await self.ping():
            return

        key = f"rate_limit:ip:{client_ip or 'unknown'}"
        try:
            current = await client.incr(key)
            if current == 1:
                await client.expire(key, window_seconds)
            ttl = max(int(await client.ttl(key) or window_seconds), 1)
        except (RedisError, RuntimeError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return

        if current > limit:
            raise RateLimited(retry_after=ttl)

    @property
    def client(self) -> redis_asyncio.Redis:
        return self._ensure_client()


cache = RedisCache()


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client is not None and request.client.host:
        return request.client.host
    return "unknown"


def build_stats_cache_key() -> str:
    return "stats:aggregate:v1"


def build_llm_cache_key(text: str, location: str) -> str:
    payload = json.dumps({"location": location, "text": text}, separators=(",", ":"), sort_keys=True)
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return f"triage:llm:{digest}"
