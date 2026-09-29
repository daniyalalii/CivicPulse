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
        if getattr(self, "_client", None) is None:
            self._client = redis_asyncio.Redis.from_url(
                settings.redis_url,
                decode_responses=True,
            )

    async def ping(self) -> bool:
        try:
            return bool(await self._client.ping())
        except (RedisError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return False

    async def get_json(self, key: str) -> Any | None:
        if not await self.ping():
            return None
        try:
            raw_value = await self._client.get(key)
        except (RedisError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return None
        if raw_value is None:
            return None
        try:
            return json.loads(raw_value)
        except (TypeError, ValueError):
            return None

    async def set_json(self, key: str, value: Any, ttl_seconds: int) -> bool:
        if not await self.ping():
            return False
        try:
            payload = json.dumps(value, separators=(",", ":"), default=str)
            await self._client.set(key, payload, ex=ttl_seconds)
            return True
        except (RedisError, TimeoutError, TypeError, ValueError):  # pragma: no cover - infrastructure dependent
            return False

    async def delete(self, key: str) -> bool:
        if not await self.ping():
            return False
        try:
            await self._client.delete(key)
            return True
        except (RedisError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return False

    async def rate_limit(self, client_ip: str, limit: int = 10, window_seconds: int = 60) -> None:
        """Reject clients who exceed the configured request quota for a sliding minute."""
        if not await self.ping():
            return

        key = f"rate_limit:ip:{client_ip or 'unknown'}"
        try:
            current = await self._client.incr(key)
            if current == 1:
                await self._client.expire(key, window_seconds)
            ttl = max(int(await self._client.ttl(key) or window_seconds), 1)
        except (RedisError, TimeoutError):  # pragma: no cover - infrastructure dependent
            return

        if current > limit:
            raise RateLimited(retry_after=ttl)

    @property
    def client(self) -> redis_asyncio.Redis:
        return self._client


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
