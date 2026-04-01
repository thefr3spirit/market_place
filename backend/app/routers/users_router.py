from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.schemas.user_schema import UserResponse, UserUpdate
from app.services.user_service import get_user_profile, update_user_profile

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return await get_user_profile(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_user_profile(current_user, data, db)
