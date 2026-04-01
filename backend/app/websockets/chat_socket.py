import uuid
import json
import logging
from typing import Dict

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.database.session import AsyncSessionLocal
from app.models.message import Message

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        # Broadcast online status to all connected users
        await self.broadcast_status(user_id, online=True)

    async def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        await self.broadcast_status(user_id, online=False)

    async def send_personal_message(self, message: dict, user_id: str):
        connection = self.active_connections.get(user_id)
        if connection:
            try:
                await connection.send_json(message)
            except Exception:
                self.active_connections.pop(user_id, None)

    async def broadcast_status(self, user_id: str, online: bool):
        """Notify all connected users about online/offline status change."""
        status_msg = {
            "type": "status",
            "user_id": user_id,
            "is_online": online,
        }
        for uid, connection in list(self.active_connections.items()):
            if uid != user_id:
                try:
                    await connection.send_json(status_msg)
                except Exception:
                    pass

    def get_online_users(self) -> list[str]:
        return list(self.active_connections.keys())


manager = ConnectionManager()


async def chat_websocket(websocket: WebSocket):
    # Authenticate via query param token
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token payload")
        return

    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")

            if msg_type == "typing":
                # Forward typing indicator
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_personal_message(
                        {"type": "typing", "sender_id": user_id},
                        receiver_id,
                    )
                continue

            # Default: chat message
            receiver_id = data.get("receiver_id")
            message_text = data.get("message", "")
            product_id = data.get("product_id")

            if not receiver_id or not message_text:
                continue

            # Persist message
            async with AsyncSessionLocal() as db:
                msg = Message(
                    sender_id=uuid.UUID(user_id),
                    receiver_id=uuid.UUID(receiver_id),
                    product_id=uuid.UUID(product_id) if product_id else None,
                    message=message_text,
                )
                db.add(msg)
                await db.commit()
                await db.refresh(msg)

                response = {
                    "type": "message",
                    "id": str(msg.id),
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "message": message_text,
                    "product_id": product_id,
                    "is_read": False,
                    "created_at": msg.created_at.isoformat(),
                }

            # Send to receiver if online
            await manager.send_personal_message(response, receiver_id)
            # Echo back to sender
            await manager.send_personal_message(response, user_id)

    except WebSocketDisconnect:
        await manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        await manager.disconnect(user_id)

    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = data.get("receiver_id")
            message_text = data.get("message", "")
            product_id = data.get("product_id")

            if not receiver_id or not message_text:
                continue

            # Persist message
            async with AsyncSessionLocal() as db:
                msg = Message(
                    sender_id=uuid.UUID(user_id),
                    receiver_id=uuid.UUID(receiver_id),
                    product_id=uuid.UUID(product_id) if product_id else None,
                    message=message_text,
                )
                db.add(msg)
                await db.commit()
                await db.refresh(msg)

                response = {
                    "id": str(msg.id),
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "product_id": product_id,
                    "message": message_text,
                    "created_at": msg.created_at.isoformat(),
                }

            # Send to receiver if online
            await manager.send_personal_message(response, receiver_id)
            # Echo back to sender
            await manager.send_personal_message(response, user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
