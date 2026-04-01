from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user_schema import UserUpdate, UserResponse


async def get_user_profile(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


async def update_user_profile(
    user: User, data: UserUpdate, db: AsyncSession
) -> UserResponse:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
