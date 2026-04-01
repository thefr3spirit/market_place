import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.order_schema import OrderCreate, OrderStatusUpdate, OrderResponse, OrderListResponse


async def create_order(data: OrderCreate, buyer: User, db: AsyncSession) -> OrderResponse:
    # Get product
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.status != "active":
        raise HTTPException(status_code=400, detail="Product is not available")
    if product.seller_id == buyer.id:
        raise HTTPException(status_code=400, detail="Cannot buy your own product")

    order = Order(
        buyer_id=buyer.id,
        seller_id=product.seller_id,
        product_id=product.id,
        price=float(product.price),
    )
    db.add(order)

    # Mark product as sold
    product.status = "sold"

    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


async def get_my_orders(user: User, db: AsyncSession) -> OrderListResponse:
    query = (
        select(Order)
        .where(or_(Order.buyer_id == user.id, Order.seller_id == user.id))
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    orders = result.scalars().all()

    count_query = select(func.count()).select_from(Order).where(
        or_(Order.buyer_id == user.id, Order.seller_id == user.id)
    )
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return OrderListResponse(
        orders=[OrderResponse.model_validate(o) for o in orders],
        total=total,
    )


async def update_order_status(
    order_id: uuid.UUID, data: OrderStatusUpdate, user: User, db: AsyncSession
) -> OrderResponse:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only seller can update order status (or buyer for cancellation)
    if order.seller_id != user.id and order.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.buyer_id == user.id and data.status != "cancelled":
        raise HTTPException(status_code=403, detail="Buyers can only cancel orders")

    order.status = data.status

    # If cancelled, reactivate product
    if data.status == "cancelled":
        result = await db.execute(select(Product).where(Product.id == order.product_id))
        product = result.scalar_one_or_none()
        if product:
            product.status = "active"

    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)
