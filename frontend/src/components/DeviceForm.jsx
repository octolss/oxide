import React, { useState } from 'react'
import './DeviceForm.css'

function DeviceForm({ onAdd, onCancel }) {
  const [macAddress, setMacAddress] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [error, setError] = useState('')

  // Функция для валидации MAC адреса
  const isValidMacAddress = (mac) => {
    // Проверяем формат MAC адреса: XX:XX:XX:XX:XX:XX или XX-XX-XX-XX-XX-XX
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return macRegex.test(mac)
  }

  // Форматирование MAC адреса
  const formatMacAddress = (value) => {
    // Убираем все кроме букв и цифр
    let cleaned = value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase()
    // Ограничиваем 12 символами
    cleaned = cleaned.substring(0, 12)
    // Добавляем двоеточия каждые 2 символа
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned
    return formatted
  }

  const handleMacChange = (e) => {
    const formatted = formatMacAddress(e.target.value)
    setMacAddress(formatted)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!macAddress.trim()) {
      setError('Ievadiet ierīces MAC adresi')
      return
    }

    if (!isValidMacAddress(macAddress.trim())) {
      setError('Nederīga MAC adrese. Formāts: XX:XX:XX:XX:XX:XX')
      return
    }

    try {
      await onAdd(macAddress.trim(), deviceName.trim() || null)
      setMacAddress('')
      setDeviceName('')
    } catch (error) {
      setError(error.response?.data?.detail || 'Kļūda pievienojot ierīci')
    }
  }

  return (
    <div className="device-form-container">
      <div className="device-form-header">
        <h2>Pievienot ierīci</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>MAC adrese *</label>
          <input
            type="text"
            value={macAddress}
            onChange={handleMacChange}
            required
            placeholder="XX:XX:XX:XX:XX:XX"
            maxLength="17"
          />
          <small className="help-text">Formāts: XX:XX:XX:XX:XX:XX</small>
        </div>
        
        <div className="form-group">
          <label>Nosaukums (nav obligāts)</label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Ievadiet ierīces nosaukumu"
          />
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Atcelt
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Pievienot
          </button>
        </div>
      </form>
    </div>
  )
}

export default DeviceForm
