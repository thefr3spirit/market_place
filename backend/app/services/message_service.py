import uuid
from typing import List

from sqlalchemy import select, or_, and_, func, case, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.models.user import User
from app.schemas.message_schema import (
    MessageSend,
    MessageResponse,
    ConversationResponse,
    ConversationPreview,
    ConversationListResponse,
)


async def send_message(data: MessageSend, sender: User, db: AsyncSession) -> MessageResponse:
    msg = Message(
        sender_id=sender.id,
        receiver_id=data.receiver_id,
        product_id=data.product_id,
        message=data.message,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return MessageResponse.model_validate(msg)


async def get_conversation(
    user: User, other_user_id: uuid.UUID, db: AsyncSession, page: int = 1, page_size: int = 50
) -> ConversationResponse:
    query = (
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == user.id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(query)
    messages = result.scalars().all()

    return ConversationResponse(
        messages=[MessageResponse.model_validate(m) for m in messages],
        total=len(messages),
    )


async def get_conversations(user: User, db: AsyncSession) -> ConversationListResponse:
    """Get a list of all conversations for the current user with last message preview."""
    from app.websockets.chat_socket import manager

    # Get all distinct conversation partners
    all_messages = await db.execute(
        select(Message)
        .where(or_(Message.sender_id == user.id, Message.receiver_id == user.id))
        .order_by(Message.created_at.desc())
    )
    messages = all_messages.scalars().all()

    # Group by conversation partner
    conversations_map = {}
    for msg in messages:
        other_id = msg.receiver_id if msg.sender_id == user.id else msg.sender_id
        if other_id not in conversations_map:
            conversations_map[other_id] = msg

    # Build conversation previews
    previews: List[ConversationPreview] = []
    for other_id, last_msg in conversations_map.items():
        # Get unread count
        unread_result = await db.execute(
            select(func.count())
            .select_from(Message)
            .where(
                and_(
                    Message.sender_id == other_id,
                    Message.receiver_id == user.id,
                    Message.is_read == False,
                )
            )
        )
        unread_count = unread_result.scalar() or 0

        # Get the other user's info
        user_result = await db.execute(select(User).where(User.id == other_id))
        other_user = user_result.scalar_one_or_none()
        if not other_user:
            continue

        previews.append(
            ConversationPreview(
                user_id=other_id,
                username=other_user.username,
                profile_image=other_user.profile_image,
                last_message=last_msg.message[:100],
                last_message_time=last_msg.created_at,
                unread_count=unread_count,
                is_online=str(other_id) in manager.active_connections,
            )
        )

    # Sort by last message time (most recent first)
    previews.sort(key=lambda p: p.last_message_time, reverse=True)

    return ConversationListResponse(conversations=previews)


async def mark_messages_read(
    user: User, other_user_id: uuid.UUID, db: AsyncSession
) -> int:
    """Mark all messages from other_user as read."""
    result = await db.execute(
        select(Message).where(
            and_(
                Message.sender_id == other_user_id,
                Message.receiver_id == user.id,
                Message.is_read == False,
            )
        )
    )
    unread = result.scalars().all()
    for msg in unread:
        msg.is_read = True
    await db.commit()
    return len(unread)
