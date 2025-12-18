import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      register: async (email, username, password) => {
        try {
          const userData = await authAPI.register(email, username, password)

          const loginData = await authAPI.login(email, password)
          localStorage.setItem('access_token', loginData.access_token)

          // Получаем данные пользователя
          const currentUser = await authAPI.getCurrentUser()

          set({
            user: currentUser,
            token: loginData.access_token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Registration error:', error)

          // Детальная обработка ошибок
          if (error.response) {
            // Сервер ответил с ошибкой
            const detail = error.response.data?.detail || error.response.data?.message
            const status = error.response.status

            if (status === 400 && detail) {
              throw new Error(detail)
            } else if (status === 500) {
              throw new Error('Servera kļūda. Pārbaudiet, vai datubāze ir pieejama.')
            } else if (detail) {
              throw new Error(detail)
            } else {
              throw new Error(`Kļūda: ${status}`)
            }
          } else if (error.request) {
            // Запрос был отправлен, но нет ответа
            throw new Error('Nav savienojuma ar serveri. Pārbaudiet, vai serveris darbojas.')
          } else {
            // Что-то пошло не так при настройке запроса
            throw new Error(error.message || 'Reģistrācijas kļūda')
          }
        }
      },

      login: async (email, password) => {
        try {
          const data = await authAPI.login(email, password)
          localStorage.setItem('access_token', data.access_token)

          // Получаем данные пользователя
          const currentUser = await authAPI.getCurrentUser()

          set({
            user: currentUser,
            token: data.access_token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Login error:', error)

          // Детальная обработка ошибок
          if (error.response) {
            const detail = error.response.data?.detail || error.response.data?.message
            const status = error.response.status

            if (status === 401) {
              throw new Error('Nepareizs e-pasts vai parole')
            } else if (status === 500) {
              throw new Error('Servera kļūda. Pārbaudiet, vai datubāze ir pieejama.')
            } else if (detail) {
              throw new Error(detail)
            } else {
              throw new Error(`Kļūda: ${status}`)
            }
          } else if (error.request) {
            throw new Error('Nav savienojuma ar serveri. Pārbaudiet, vai serveris darbojas.')
          } else {
            throw new Error(error.message || 'Pieslēgšanās kļūda')
          }
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false })
          return false
        }

        try {
          const currentUser = await authAPI.getCurrentUser()
          set({
            user: currentUser,
            token: token,
            isAuthenticated: true,
          })
          return true
        } catch (error) {
          localStorage.removeItem('access_token')
          set({ user: null, token: null, isAuthenticated: false })
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
