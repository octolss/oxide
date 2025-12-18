from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid

class DeviceCreate(BaseModel):
    mac_address: str
    device_name: Optional[str] = None

class DeviceResponse(BaseModel):
    device_id: str
    device_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class DeviceUserResponse(BaseModel):
    id: uuid.UUID
    device_id: str
    device_name: Optional[str]
    added_at: datetime
    
    class Config:
        from_attributes = True

