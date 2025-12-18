import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SensorView from './pages/SensorView'
import Login from './pages/Login'
import Register from './pages/Register'
import useThemeStore from './store/themeStore'
import useAuthStore from './store/authStore'
import './App.css'

// Защищённый роут
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Публичный роут (только для неавторизованных)
function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function App() {
  const theme = useThemeStore((state) => state.theme)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    // Проверяем авторизацию при запуске
    checkAuth().finally(() => setInitializing(false))
  }, [checkAuth])

  if (initializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Ielādē...
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/sensor/:deviceId" element={<PrivateRoute><SensorView /></PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
