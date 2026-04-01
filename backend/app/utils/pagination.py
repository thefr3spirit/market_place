from typing import Optional


def paginate(page: int = 1, page_size: int = 20) -> dict:
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 1
    if page_size > 100:
        page_size = 100
    offset = (page - 1) * page_size
    return {"offset": offset, "limit": page_size, "page": page, "page_size": page_size}
