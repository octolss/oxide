import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import useAuthStore from '../store/authStore'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      console.log('Login successful via store')
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
      setError(err.message || 'Pieslēgšanās kļūda')
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
        <h1>Pieslēgties</h1>
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
            {loading ? 'Pieslēdzas...' : 'Pieslēgties'}
          </button>
        </form>
        <p className="auth-link">
          Nav konta? <Link to="/register">Reģistrēties</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
