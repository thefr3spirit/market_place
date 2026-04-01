from app.workers.celery_worker import celery_app


@celery_app.task
def process_order(order_id: str):
    """Process order asynchronously."""
    pass


@celery_app.task
def send_email_notification(to_email: str, subject: str, body: str):
    """Send email notification."""
    pass


@celery_app.task
def update_search_index(product_data: dict):
    """Update Meilisearch index."""
    from app.core.search import get_products_index

    index = get_products_index()
    index.add_documents([product_data])


@celery_app.task
def remove_from_search_index(product_id: str):
    """Remove product from search index."""
    from app.core.search import get_products_index

    index = get_products_index()
    index.delete_document(product_id)


@celery_app.task
def optimize_image(image_url: str):
    """Optimize uploaded image."""
    pass
