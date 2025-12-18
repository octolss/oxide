import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './DeviceDetail.css'

function DeviceDetail() {
  const { macAddress } = useParams()
  const navigate = useNavigate()
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMeasurements()
    const interval = setInterval(fetchMeasurements, 5000)
    return () => clearInterval(interval)
  }, [macAddress])

  const fetchMeasurements = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/measurements/device/${macAddress}?limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch measurements')
      }
      
      const data = await response.json()
      setMeasurements(data)
      setError('')
    } catch (err) {
      console.error('Error fetching measurements:', err)
      setError('Nevar ielādēt mērījumus')
    } finally {
      setLoading(false)
    }
  }

  const chartData = measurements
    .slice()
    .reverse()
    .map((m) => ({
      time: new Date(m.measured_at).toLocaleTimeString('lv-LV'),
      temperature: m.temperature,
      humidity: m.humidity,
      co2: m.co2
    }))

  if (loading) {
    return <div className="device-detail-container"><p>Ielādē...</p></div>
  }

  const latestMeasurement = measurements[0]

  return (
    <div className="device-detail-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Atpakaļ
      </button>
      
      <h1>Ierīce: {macAddress}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {latestMeasurement && (
        <div className="current-values">
          <div className="value-card">
            <span className="value-icon">🌡️</span>
            <div className="value-info">
              <span className="value-label">Temperatūra</span>
              <span className="value-number">{latestMeasurement.temperature.toFixed(1)}°C</span>
            </div>
          </div>
          
          <div className="value-card">
            <span className="value-icon">💧</span>
            <div className="value-info">
              <span className="value-label">Mitrums</span>
              <span className="value-number">{latestMeasurement.humidity.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="value-card">
            <span className="value-icon">🌫️</span>
            <div className="value-info">
              <span className="value-label">CO2</span>
              <span className="value-number">{latestMeasurement.co2.toFixed(0)} ppm</span>
            </div>
          </div>
        </div>
      )}
      
      {chartData.length > 0 && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>Temperatūra</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ff6b6b" name="Temperatūra (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Mitrums</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="humidity" stroke="#4ecdc4" name="Mitrums (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>CO2</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="co2" stroke="#95e1d3" name="CO2 (ppm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {measurements.length === 0 && (
        <p className="no-data">Nav pieejami mērījumi šai ierīcei</p>
      )}
    </div>
  )
}

export default DeviceDetail


