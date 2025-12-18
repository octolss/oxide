import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (email, username, password) => {
    const response = await api.post('/auth/register', {
      email,
      username,
      password,
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Devices API
export const devicesAPI = {
  list: async () => {
    const response = await api.get('/measurements/devices')
    return response.data
  },

  add: async (mac_address, device_name) => {
    const response = await api.post('/measurements/devices', {
      mac_address,
      device_name,
    })
    return response.data
  },

  delete: async (mac_address) => {
    const response = await api.delete(`/measurements/devices/${mac_address}`)
    return response.data
  },
}

// Measurements API
export const measurementsAPI = {
  getDeviceMeasurements: async (mac_address, limit = 100) => {
    const response = await api.get(`/measurements/device/${mac_address}`, {
      params: { limit },
    })
    return response.data
  },
}

export default api

