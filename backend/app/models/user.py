from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, Union
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: Union[str, uuid.UUID]
    email: EmailStr
    username: str
    created_at: Union[str, datetime]
    
    @field_validator('created_at', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

