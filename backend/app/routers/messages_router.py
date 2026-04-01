import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.schemas.message_schema import (
    MessageSend,
    MessageResponse,
    ConversationResponse,
    ConversationListResponse,
)
from app.services.message_service import (
    send_message,
    get_conversation,
    get_conversations,
    mark_messages_read,
)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_conversations(current_user, db)


@router.post("/send", response_model=MessageResponse, status_code=201)
async def send(
    data: MessageSend,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await send_message(data, current_user, db)


@router.get("/conversation/{user_id}", response_model=ConversationResponse)
async def conversation(
    user_id: uuid.UUID,
    page: int = Query(1, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_conversation(current_user, user_id, db, page)


@router.post("/read/{user_id}")
async def mark_read(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count = await mark_messages_read(current_user, user_id, db)
    return {"marked_read": count}
