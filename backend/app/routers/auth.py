from fastapi import APIRouter, Depends
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.controllers.auth_controller import (
    register_user_controller,
    login_user_controller,
    get_current_user
)

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"status": "ok", "message": "Test endpoint works!"}

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Registration endpoint"""
    return await register_user_controller(user_data)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login endpoint"""
    return await login_user_controller(user_data)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user"""
    return UserResponse(**current_user)
