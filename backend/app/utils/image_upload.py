import uuid
from typing import Optional

from supabase import create_client
from app.core.config import get_settings

settings = get_settings()


def get_supabase_client():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


async def upload_image(file_bytes: bytes, filename: str, bucket: str = "product-images") -> str:
    client = get_supabase_client()
    unique_name = f"{uuid.uuid4()}_{filename}"
    path = f"images/{unique_name}"
    client.storage.from_(bucket).upload(path, file_bytes, {"content-type": "image/jpeg"})
    public_url = client.storage.from_(bucket).get_public_url(path)
    return public_url
