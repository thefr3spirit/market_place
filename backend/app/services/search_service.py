from typing import Optional

from app.core.redis import cache_get, cache_set
from app.core.search import get_products_index


async def search_products(
    query: str,
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    condition: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    cache_key = f"search:{query}:{category_id}:{min_price}:{max_price}:{location}:{condition}:{page}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    index = get_products_index()

    # Build filter
    filters = ["status = active"]
    if category_id:
        filters.append(f"category_id = '{category_id}'")
    if min_price is not None:
        filters.append(f"price >= {min_price}")
    if max_price is not None:
        filters.append(f"price <= {max_price}")
    if location:
        filters.append(f"location = '{location}'")
    if condition:
        filters.append(f"condition = '{condition}'")

    filter_str = " AND ".join(filters) if filters else None

    try:
        result = index.search(
            query,
            {
                "filter": filter_str,
                "limit": page_size,
                "offset": (page - 1) * page_size,
            },
        )
        response = {
            "hits": result.get("hits", []),
            "total": result.get("estimatedTotalHits", 0),
            "page": page,
            "page_size": page_size,
            "query": query,
        }
    except Exception:
        # Meilisearch not available – return empty results gracefully
        response = {
            "hits": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "query": query,
        }

    await cache_set(cache_key, response, expire=120)
    return response


def index_product(product_data: dict):
    try:
        index = get_products_index()
        index.add_documents([product_data])
    except Exception:
        pass


def remove_product_from_index(product_id: str):
    try:
        index = get_products_index()
        index.delete_document(product_id)
    except Exception:
        pass
