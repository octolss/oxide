import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ThemeToggle from '../components/ThemeToggle'
import UserMenu from '../components/UserMenu'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'
import useDeviceStore from '../store/deviceStore'
import useMeasurementStore from '../store/measurementStore'
import './SensorView.css'

function SensorView() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.theme)
  const devices = useDeviceStore((state) => state.devices)
  const { measurements, loading, fetchMeasurements } = useMeasurementStore()

  const device = devices.find(d => d.device_id === deviceId)
  const deviceName = device?.device_name || 'Sensors'
  const macAddress = device?.device_id || deviceId

  useEffect(() => {
    if (deviceId) {
      // Загружаем измерения
      fetchMeasurements(deviceId, 100)
      
      // Обновляем каждые 10 секунд
      const interval = setInterval(() => {
        fetchMeasurements(deviceId, 100)
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [deviceId, fetchMeasurements])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('lv-LV', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const chartData = measurements.map(item => ({
    time: formatDate(item.measured_at),
    mitrums: item.humidity ? parseFloat(item.humidity) : null,
    co2: item.co2 ? parseFloat(item.co2) : null,
    temperatura: item.temperature ? parseFloat(item.temperature) : null
  })).reverse()

  const latestData = measurements[0] || {}
  const latestMitrums = latestData.humidity ? parseFloat(latestData.humidity) : null
  const latestCO2 = latestData.co2 ? parseFloat(latestData.co2) : null
  const latestTemperatura = latestData.temperature ? parseFloat(latestData.temperature) : null

  return (
    <div className="sensor-view">
      <header className="sensor-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Atpakaļ
          </button>
          <div className="header-info">
            <h1>{deviceName || 'Sensors'}</h1>
            <div className="device-id-badge">{macAddress}</div>
          </div>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <div className="sensor-content">
        <div className="sensor-cards">
          <div className="sensor-card">
            <div className="sensor-card-label">Mitrums</div>
            <div className="sensor-card-value">
              {latestMitrums !== null ? `${latestMitrums.toFixed(2)}%` : '—'}
            </div>
          </div>
          <div className="sensor-card">
            <div className="sensor-card-label">CO₂</div>
            <div className="sensor-card-value">
              {latestCO2 !== null ? `${latestCO2.toFixed(2)} ppm` : '—'}
            </div>
          </div>
          <div className="sensor-card">
            <div className="sensor-card-label">Temperatūra</div>
            <div className="sensor-card-value">
              {latestTemperatura !== null ? `${latestTemperatura.toFixed(2)}°C` : '—'}
            </div>
          </div>
        </div>

        <div className="sensor-chart">
          <h2>Datu grafiks</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#3a3a3a' : '#e1e4e8'} 
              />
              <XAxis 
                dataKey="time" 
                stroke={theme === 'dark' ? '#a0a0a0' : '#666666'}
              />
              <YAxis 
                yAxisId="left" 
                stroke={theme === 'dark' ? '#a0a0a0' : '#666666'}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke={theme === 'dark' ? '#a0a0a0' : '#666666'}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#3a3a3a' : '#e1e4e8'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#e4e4e4' : '#1a1a1a'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mitrums"
                stroke="#5b6eff"
                name="Mitrums (%)"
                dot={false}
                strokeWidth={3}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="co2"
                stroke="#10b981"
                name="CO₂ (ppm)"
                dot={false}
                strokeWidth={3}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperatura"
                stroke="#f59e0b"
                name="Temperatūra (°C)"
                dot={false}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default SensorView

