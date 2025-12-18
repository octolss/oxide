"""Test Supabase connection"""
from app.database import supabase

print("Testing Supabase connection...")

try:
    # Try to query users table
    response = supabase.table("users").select("*").limit(1).execute()
    print("SUCCESS: Connected to Supabase!")
    print(f"Response: {response}")
except Exception as e:
    print(f"ERROR: {e}")

