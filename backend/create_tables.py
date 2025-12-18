"""
Script to create database tables
"""
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.config import get_settings

settings = get_settings()
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class DeviceInfo(Base):
    __tablename__ = "device_info"
    
    device_id = Column(String(17), primary_key=True)  # MAC address
    device_name = Column(String(100))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class DeviceUser(Base):
    __tablename__ = "device_users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(17), ForeignKey("device_info.device_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Measurement(Base):
    __tablename__ = "measurements"
    
    measurement_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_users_id = Column(UUID(as_uuid=True), ForeignKey("device_users.id", ondelete="CASCADE"), nullable=False)
    temperature = Column(DECIMAL(5, 2))
    humidity = Column(DECIMAL(5, 2))
    co2 = Column(DECIMAL(7, 2))
    measured_at = Column(DateTime(timezone=True), default=datetime.utcnow)

if __name__ == "__main__":
    print("Creating database tables...")
    print(f"Database URL: {settings.database_url.split('@')[0]}@...")
    
    try:
        engine = create_engine(settings.database_url)
        Base.metadata.create_all(engine)
        print("✓ Tables created successfully!")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")

