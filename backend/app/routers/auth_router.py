from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.user_schema import UserCreate, UserLogin, TokenResponse
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await register_user(data, db)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await login_user(data, db)
