import redis.asyncio as redis
from app.core.config import get_settings
import json
from typing import Optional

settings = get_settings()

redis_client: Optional[redis.Redis] = None
_redis_available = True


async def get_redis() -> Optional[redis.Redis]:
    global redis_client, _redis_available
    if not _redis_available:
        return None
    if redis_client is None:
        try:
            redis_client = redis.from_url(
                settings.REDIS_URL, encoding="utf-8", decode_responses=True
            )
            await redis_client.ping()
        except Exception:
            redis_client = None
            _redis_available = False
            return None
    return redis_client


async def cache_set(key: str, value: dict, expire: int = 300):
    r = await get_redis()
    if not r:
        return
    try:
        await r.set(key, json.dumps(value), ex=expire)
    except Exception:
        pass


async def cache_get(key: str) -> Optional[dict]:
    r = await get_redis()
    if not r:
        return None
    try:
        data = await r.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


async def cache_delete(key: str):
    r = await get_redis()
    if not r:
        return
    try:
        await r.delete(key)
    except Exception:
        pass


async def cache_delete_pattern(pattern: str):
    r = await get_redis()
    if not r:
        return
    try:
        async for key in r.scan_iter(match=pattern):
            await r.delete(key)
    except Exception:
        pass


async def close_redis():
    global redis_client
    if redis_client:
        try:
            await redis_client.close()
        except Exception:
            pass
        redis_client = None
