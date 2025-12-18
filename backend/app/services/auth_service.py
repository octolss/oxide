from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.database import supabase
from app.models.user import UserCreate, TokenData
from app.config import get_settings
import uuid
import hashlib
import base64

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _prehash_password(password: str) -> str:
    """Pre-hash password with SHA-256 to handle bcrypt's 72 byte limit"""
    return base64.b64encode(hashlib.sha256(password.encode()).digest()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_prehash_password(plain_password), hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(_prehash_password(password))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def authenticate_user(email: str, password: str):
    """Authenticate user by email and password"""
    response = supabase.table("users").select("*").eq("email", email).execute()
    
    if not response.data or len(response.data) == 0:
        return None
    
    user = response.data[0]
    if not verify_password(password, user["password_hash"]):
        return None
    
    return user

def create_user(user: UserCreate):
    """Create a new user"""
    hashed_password = get_password_hash(user.password)
    user_id = str(uuid.uuid4())
    
    user_data = {
        "user_id": user_id,
        "email": user.email,
        "username": user.username,
        "password_hash": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("users").insert(user_data).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    
    return None

def get_user_by_email(email: str):
    """Get user by email"""
    response = supabase.table("users").select("*").eq("email", email).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    
    return None

def get_user_by_username(username: str):
    """Get user by username"""
    response = supabase.table("users").select("*").eq("username", username).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    
    return None

def get_user_by_id(user_id: str):
    """Get user by ID"""
    response = supabase.table("users").select("*").eq("user_id", user_id).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    
    return None

def decode_token(token: str) -> Optional[TokenData]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(user_id=user_id)
    except JWTError:
        return None
