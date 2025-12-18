from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, User
from app.models.device import DeviceCreate, DeviceResponse, DeviceUserResponse
from app.controllers.auth_controller import get_current_user
from app.controllers.device_controller import (
    add_device_controller,
    get_user_devices_controller,
    delete_device_controller
)

router = APIRouter()

@router.post("", response_model=DeviceResponse)
async def add_device(
    device_data: DeviceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Добавить устройство"""
    return await add_device_controller(device_data, current_user, db)

@router.get("", response_model=List[DeviceUserResponse])
async def list_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить список устройств пользователя"""
    return await get_user_devices_controller(current_user, db)

@router.delete("/{mac_address}")
async def delete_device(
    mac_address: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить устройство"""
    return await delete_device_controller(mac_address, current_user, db)

