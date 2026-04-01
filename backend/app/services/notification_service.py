"""Notification service — uses FastAPI background tasks for async operations."""

from typing import Optional


async def send_order_notification(buyer_email: str, seller_email: str, order_id: str):
    """Placeholder for email/push notification on new order."""
    # Integrate with email service (SendGrid, SES, etc.)
    pass


async def send_message_notification(receiver_email: str, sender_name: str):
    """Placeholder for new message notification."""
    pass
