import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DeviceForm from '../components/DeviceForm'
import DeviceList from '../components/DeviceList'
import ThemeToggle from '../components/ThemeToggle'
import UserMenu from '../components/UserMenu'
import useAuthStore from '../store/authStore'
import useDeviceStore from '../store/deviceStore'
import './Dashboard.css'

function Dashboard() {
  const [showAddForm, setShowAddForm] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { devices, loading, error, fetchDevices, addDevice, deleteDevice } = useDeviceStore()

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const handleAddDevice = async (macAddress, deviceName) => {
    try {
      await addDevice(macAddress, deviceName)
      setShowAddForm(false)
    } catch (error) {
      // Ошибка обрабатывается в store
      throw error
    }
  }

  const handleDeleteDevice = async (macAddress) => {
    try {
      await deleteDevice(macAddress)
    } catch (error) {
      alert('Kļūda dzēšot ierīci')
    }
  }

  const handleDeviceClick = (macAddress) => {
    navigate(`/sensor/${macAddress}`)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Sensoru Pārvaldes Sistēma</h1>
          <div className="header-actions">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-add-device"
          >
            + Pievienot ierīci
          </button>
          <DeviceList
            devices={devices}
            onDeviceClick={handleDeviceClick}
            onDeleteDevice={handleDeleteDevice}
          />
        </aside>

        <main className="main-content">
          {showAddForm ? (
            <DeviceForm
              onAdd={handleAddDevice}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <div className="empty-state">
              <h2>Izvēlieties ierīci no saraksta</h2>
              <p>Vai pievienojiet jaunu ierīci</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
