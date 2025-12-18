from fastapi import APIRouter, Query, Depends
from typing import List
from pydantic import BaseModel

from app.controllers.measurement_controller import (
    receive_measurement_controller,
    get_device_measurements_controller,
    get_all_devices_controller,
    add_device_controller
)
from app.controllers.auth_controller import get_current_user

router = APIRouter()

# Pydantic models
class MeasurementReceive(BaseModel):
    mac_address: str
    temperature: float
    humidity: float
    co2: float
    oxygen: float | None = None
    particles: float | None = None

class MeasurementResponse(BaseModel):
    measurement_id: str
    mac_address: str | None = None
    device_id: str | None = None 
    temperature: float | None
    humidity: float | None
    co2: int | None
    oxygen: float | None
    particles: float | None
    measured_at: str

class DeviceResponse(BaseModel):
    mac_address: str
    device_name: str
    latest_measurement: dict | None

class DeviceCreate(BaseModel):
    mac_address: str
    device_name: str

@router.post("/receive", response_model=MeasurementResponse)
async def receive_measurement(data: MeasurementReceive):
    """Receive measurement from ESP32/Arduino"""
    return await receive_measurement_controller(
        data.mac_address,
        data.temperature,
        data.humidity,
        data.co2,
        data.oxygen,
        data.particles
    )

@router.get("/device/{mac_address}", response_model=List[MeasurementResponse])
async def get_device_measurements(
    mac_address: str,
    limit: int = Query(100, ge=1, le=1000)
):
    """Get measurements for specific device"""
    return await get_device_measurements_controller(mac_address, limit)

@router.get("/devices", response_model=List[DeviceResponse])
async def get_all_devices():
    """Get all devices with their latest measurements"""
    return await get_all_devices_controller()

@router.post("/devices")
async def add_device(
    device_data: DeviceCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new device (manual registration)"""
    return await add_device_controller(
        device_data.mac_address,
        device_data.device_name,
        current_user["user_id"]
    )
