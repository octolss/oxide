import { create } from 'zustand'
import { devicesAPI } from '../services/api'

const useDeviceStore = create((set) => ({
  devices: [],
  loading: false,
  error: null,

  fetchDevices: async () => {
    set({ loading: true, error: null })
    try {
      const data = await devicesAPI.list()
      set({ devices: data, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Kļūda ielādējot ierīces', 
        loading: false 
      })
    }
  },

  addDevice: async (mac_address, device_name) => {
    set({ loading: true, error: null })
    try {
      await devicesAPI.add(mac_address, device_name)
      // Перезагружаем список устройств
      const data = await devicesAPI.list()
      set({ devices: data, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Kļūda pievienojot ierīci', 
        loading: false 
      })
      throw error
    }
  },

  deleteDevice: async (mac_address) => {
    set({ loading: true, error: null })
    try {
      await devicesAPI.delete(mac_address)
      // Обновляем список устройств локально
      set((state) => ({
        devices: state.devices.filter((d) => d.device_id !== mac_address),
        loading: false,
      }))
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Kļūda dzēšot ierīci', 
        loading: false 
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))

export default useDeviceStore
