from fastapi import HTTPException, status
from datetime import datetime
from typing import List, Optional
import uuid
from app.database import supabase

async def receive_measurement_controller(mac_address: str, temperature: float, humidity: float, co2: float, oxygen: float | None = None, particles: float | None = None):
    """Receive measurement from Arduino and save to Supabase"""
    try:
        # 1. Check if device exists, if not create it
        device_response = supabase.table("device_info").select("*").eq("device_id", mac_address).execute()
        
        if not device_response.data:
            # Create new device
            new_device = {
                "device_id": mac_address,
                "device_name": f"Device {mac_address[-6:]}",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("device_info").insert(new_device).execute()
        
        # 2. Save measurement
        # Note: We are using device_id directly now (requires SQL migration below)
        measurement_data = {
            "device_id": mac_address,
            "temperature": temperature,
            "humidity": humidity,
            "co2": co2,
            "oxygen": oxygen,
            "particles": particles,
            "measured_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("measurements").insert(measurement_data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
            
        raise HTTPException(status_code=500, detail="Failed to insert measurement")

    except Exception as e:
        print(f"Error saving measurement: {str(e)}")
        # If error is about foreign key or column, it means SQL migration wasn't run
        if "device_id" in str(e) or "column" in str(e):
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database schema mismatch. Please run the provided SQL migration. Error: {str(e)}"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving measurement: {str(e)}"
        )

async def get_device_measurements_controller(mac_address: str, limit: int = 100):
    """Get measurements for a specific device from Supabase"""
    try:
        response = supabase.table("measurements")\
            .select("*")\
            .eq("device_id", mac_address)\
            .order("measured_at", desc=True)\
            .limit(limit)\
            .execute()
            
        return response.data
    except Exception as e:
        print(f"Error getting measurements: {str(e)}")
        return []

async def get_all_devices_controller():
    """Get all known devices from Supabase"""
    try:
        # Get all devices
        devices_response = supabase.table("device_info").select("*").execute()
        devices = devices_response.data
        
        result = []
        for device in devices:
            # Get latest measurement for each device
            latest_response = supabase.table("measurements")\
                .select("*")\
                .eq("device_id", device["device_id"])\
                .order("measured_at", desc=True)\
                .limit(1)\
                .execute()
                
            latest = latest_response.data[0] if latest_response.data else None
            
            result.append({
                "mac_address": device["device_id"],
                "device_name": device["device_name"],
                "latest_measurement": latest
            })
            
        return result
    except Exception as e:
        print(f"Error getting devices: {str(e)}")
        return []

async def add_device_controller(mac_address: str, device_name: str, user_id: str):
    """Add a device manually and link it to the user"""
    try:
        # 1. Ensure device exists in device_info
        device_response = supabase.table("device_info").select("*").eq("device_id", mac_address).execute()
        
        if not device_response.data:
            new_device = {
                "device_id": mac_address,
                "device_name": device_name,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("device_info").insert(new_device).execute()
        else:
            # Update name if provided and different
            if device_name:
                supabase.table("device_info").update({"device_name": device_name}).eq("device_id", mac_address).execute()
        
        # 2. Link to user in device_users
        # Check if link exists
        link_response = supabase.table("device_users")\
            .select("*")\
            .eq("device_id", mac_address)\
            .eq("user_id", user_id)\
            .execute()
            
        if not link_response.data:
            new_link = {
                "device_id": mac_address,
                "user_id": user_id,
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("device_users").insert(new_link).execute()
            
        return {"status": "success", "message": "Device added successfully"}
        
    except Exception as e:
        print(f"Error adding device: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding device: {str(e)}"
        )
