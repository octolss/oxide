import { create } from 'zustand'
import { measurementsAPI } from '../services/api'

const useMeasurementStore = create((set) => ({
  measurements: [],
  loading: false,
  error: null,

  fetchMeasurements: async (mac_address, limit = 100) => {
    set({ loading: true, error: null })
    try {
      const data = await measurementsAPI.getDeviceMeasurements(mac_address, limit)
      set({ measurements: data, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Kļūda ielādējot mērījumus', 
        loading: false 
      })
    }
  },

  clearMeasurements: () => {
    set({ measurements: [], error: null })
  },

  clearError: () => set({ error: null }),
}))

export default useMeasurementStore
