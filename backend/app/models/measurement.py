from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal
import uuid

class MeasurementCreate(BaseModel):
    device_id: str  # MAC address
    temperature: Optional[Decimal] = None
    humidity: Optional[Decimal] = None
    co2: Optional[Decimal] = None

class MeasurementResponse(BaseModel):
    measurement_id: uuid.UUID
    temperature: Optional[Decimal]
    humidity: Optional[Decimal]
    co2: Optional[Decimal]
    measured_at: datetime
    
    class Config:
        from_attributes = True

