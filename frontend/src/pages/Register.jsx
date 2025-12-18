import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import useAuthStore from '../store/authStore'
import './Auth.css'

function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Получаем функцию register из стора
  const register = useAuthStore((state) => state.register)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(email, username, password)
      console.log('Registration successful via store')
      navigate('/')
    } catch (err) {
      console.error('Registration failed:', err)
      setError(err.message || 'Reģistrācijas kļūda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <h1>Reģistrācija</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-pasts</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Lietotājvārds</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Parole</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Reģistrējas...' : 'Reģistrēties'}
          </button>
        </form>
        <p className="auth-link">
          Jau ir konts? <Link to="/login">Pieslēgties</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
