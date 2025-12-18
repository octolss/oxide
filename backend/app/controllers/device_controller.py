from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import DeviceInfo, DeviceUser, User
from app.models.device import DeviceCreate, DeviceResponse, DeviceUserResponse
import uuid

async def add_device_controller(device_data: DeviceCreate, user: User, db: Session):
    # Проверяем/создаём устройство в device_info
    device = db.query(DeviceInfo).filter(DeviceInfo.device_id == device_data.mac_address).first()
    
    if not device:
        device = DeviceInfo(
            device_id=device_data.mac_address,
            device_name=device_data.device_name
        )
        db.add(device)
        db.commit()
        db.refresh(device)
    
    # Проверяем, не добавлено ли уже это устройство пользователю
    existing_link = db.query(DeviceUser).filter(
        DeviceUser.device_id == device_data.mac_address,
        DeviceUser.user_id == user.user_id
    ).first()
    
    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ierīce jau ir pievienota"
        )
    
    # Связываем устройство с пользователем
    device_user = DeviceUser(
        device_id=device_data.mac_address,
        user_id=user.user_id
    )
    db.add(device_user)
    db.commit()
    db.refresh(device)
    
    return DeviceResponse.model_validate(device)

async def get_user_devices_controller(user: User, db: Session) -> List[DeviceUserResponse]:
    # Получаем устройства пользователя
    devices = db.query(
        DeviceUser.id,
        DeviceUser.device_id,
        DeviceInfo.device_name,
        DeviceUser.created_at
    ).join(
        DeviceInfo, DeviceUser.device_id == DeviceInfo.device_id
    ).filter(
        DeviceUser.user_id == user.user_id
    ).all()
    
    return [
        DeviceUserResponse(
            id=d.id,
            device_id=d.device_id,
            device_name=d.device_name,
            added_at=d.created_at
        )
        for d in devices
    ]

async def delete_device_controller(mac_address: str, user: User, db: Session):
    device_user = db.query(DeviceUser).filter(
        DeviceUser.device_id == mac_address,
        DeviceUser.user_id == user.user_id
    ).first()
    
    if not device_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ierīce nav atrasta"
        )
    
    db.delete(device_user)
    db.commit()
    return {"message": "Ierīce dzēsta"}

