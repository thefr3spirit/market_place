import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.schemas.order_schema import OrderCreate, OrderStatusUpdate, OrderResponse, OrderListResponse
from app.services.order_service import create_order, get_my_orders, update_order_status

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_order(data, current_user, db)


@router.get("/my-orders", response_model=OrderListResponse)
async def my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_my_orders(current_user, db)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_status(
    order_id: uuid.UUID,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_order_status(order_id, data, current_user, db)
