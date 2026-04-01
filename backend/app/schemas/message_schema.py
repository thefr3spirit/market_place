import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class MessageSend(BaseModel):
    receiver_id: uuid.UUID
    product_id: Optional[uuid.UUID] = None
    message: str


class MessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    product_id: Optional[uuid.UUID] = None
    message: str
    is_read: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    messages: List[MessageResponse]
    total: int


class ConversationPreview(BaseModel):
    user_id: uuid.UUID
    username: str
    profile_image: Optional[str] = None
    last_message: str
    last_message_time: datetime
    unread_count: int
    is_online: bool = False


class ConversationListResponse(BaseModel):
    conversations: List[ConversationPreview]
