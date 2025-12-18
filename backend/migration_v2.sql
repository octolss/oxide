-- Migration to fix measurements table relationship
-- Run this in Supabase SQL Editor

-- 1. Drop existing measurements table (recreate to fix FK)
DROP TABLE IF EXISTS measurements;

-- 2. Recreate measurements table linked to device_info directly
CREATE TABLE measurements (
    measurement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL REFERENCES device_info(device_id) ON DELETE CASCADE,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    co2 INTEGER,
    oxygen DECIMAL(5,2), -- Added to support user's custom fields
    particles DECIMAL(5,2), -- Added to support user's custom fields
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create index for performance
CREATE INDEX idx_measurements_device_id ON measurements(device_id);
CREATE INDEX idx_measurements_measured_at ON measurements(measured_at);

-- 4. Enable RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Anyone can insert (for ESP32)
CREATE POLICY "Anyone can insert measurements" 
ON measurements FOR INSERT 
WITH CHECK (true);

-- 6. Policy: Users can view measurements for their devices
CREATE POLICY "Users can view measurements for their devices" 
ON measurements FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM device_users du
        WHERE du.device_id = measurements.device_id
        AND du.user_id = auth.uid()
    )
);

-- 7. Update view for latest measurements (if it existed)
DROP VIEW IF EXISTS device_latest_measurements;

CREATE VIEW device_latest_measurements AS
SELECT DISTINCT ON (m.device_id)
    m.measurement_id,
    m.device_id,
    m.temperature,
    m.humidity,
    m.co2,
    m.oxygen,
    m.particles,
    m.measured_at
FROM measurements m
ORDER BY m.device_id, m.measured_at DESC;
