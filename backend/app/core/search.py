import meilisearch
from app.core.config import get_settings
from typing import Optional

settings = get_settings()

_client: Optional[meilisearch.Client] = None


def get_search_client() -> meilisearch.Client:
    global _client
    if _client is None:
        _client = meilisearch.Client(settings.MEILI_HOST, settings.MEILI_KEY)
    return _client


def init_search_index():
    client = get_search_client()
    index = client.index("products")
    index.update_filterable_attributes(
        ["category_id", "category_name", "price", "location", "condition", "status"]
    )
    index.update_sortable_attributes(["price", "created_at"])
    index.update_searchable_attributes(
        ["title", "description", "category_name", "location"]
    )
    return index


def get_products_index():
    client = get_search_client()
    return client.index("products")
