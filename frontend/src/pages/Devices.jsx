import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Devices.css'

function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDevices()
    // Обновляем каждые 5 секунд
    const interval = setInterval(fetchDevices, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/measurements/devices')
      
      if (!response.ok) {
        throw new Error('Failed to fetch devices')
      }
      
      const data = await response.json()
      setDevices(data)
      setError('')
    } catch (err) {
      console.error('Error fetching devices:', err)
      setError('Nevar ielādēt ierīces')
    } finally {
      setLoading(false)
    }
  }

  const viewDeviceDetails = (macAddress) => {
    navigate(`/device/${macAddress}`)
  }

  if (loading) {
    return <div className="devices-container"><p>Ielādē...</p></div>
  }

  return (
    <div className="devices-container">
      <h1>Sensoru Ierīces</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {devices.length === 0 ? (
        <p className="no-devices">Nav atrasta neviena ierīce. Gaidām datus no sensoriem...</p>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => (
            <div 
              key={device.mac_address} 
              className="device-card"
              onClick={() => viewDeviceDetails(device.mac_address)}
            >
              <div className="device-header">
                <h3>{device.device_name}</h3>
                <span className="device-mac">{device.mac_address}</span>
              </div>
              
              {device.latest_measurement ? (
                <div className="device-data">
                  <div className="data-item">
                    <span className="data-label">🌡️ Temperatūra:</span>
                    <span className="data-value">{device.latest_measurement.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">💧 Mitrums:</span>
                    <span className="data-value">{device.latest_measurement.humidity.toFixed(1)}%</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">🌫️ CO2:</span>
                    <span className="data-value">{device.latest_measurement.co2.toFixed(0)} ppm</span>
                  </div>
                  <div className="data-timestamp">
                    Pēdējais mērījums: {new Date(device.latest_measurement.measured_at).toLocaleString('lv-LV')}
                  </div>
                </div>
              ) : (
                <p className="no-data">Nav pieejami mērījumi</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Devices


