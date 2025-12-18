from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.config import get_settings
from app.services.auth_service import (
    create_user,
    authenticate_user,
    create_access_token,
    get_user_by_email,
    get_user_by_id,
    decode_token
)

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = decode_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = get_user_by_id(token_data.user_id)
    if user is None:
        raise credentials_exception
    
    return user

async def register_user_controller(user_data: UserCreate):
    """Register new user"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user in Supabase
        user = create_user(user_data)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        return UserResponse(
            user_id=user["user_id"],
            email=user["email"],
            username=user["username"],
            created_at=user["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {str(e)}"
        )

async def login_user_controller(user_data: UserLogin):
    """Login user"""
    user = authenticate_user(user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["user_id"]},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")
