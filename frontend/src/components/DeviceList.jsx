import React from 'react'
import './DeviceList.css'

function DeviceList({ devices, onDeviceClick, onDeleteDevice }) {
  if (devices.length === 0) {
    return (
      <div className="device-list-empty">
        <p>Nav ierīču</p>
        <p className="hint">Pievienojiet ierīci, lai sāktu darbu</p>
      </div>
    )
  }

  return (
    <div className="device-list">
      <h3>Ierīces</h3>
      <ul>
        {devices.map(device => (
          <li
            key={device.device_id}
            onClick={() => onDeviceClick(device.device_id)}
          >
            <div className="device-info">
              <div className="device-name">{device.device_name || device.device_id}</div>
              <div className="device-id">{device.device_id}</div>
            </div>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Dzēst šo ierīci?')) {
                  onDeleteDevice(device.device_id)
                }
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DeviceList
