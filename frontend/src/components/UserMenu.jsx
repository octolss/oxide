import React, { useState, useRef, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import './UserMenu.css'

function UserMenu() {
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const getInitials = (username) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          {getInitials(user?.username || 'U')}
        </div>
        <span className="user-name">{user?.username}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`chevron ${isOpen ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-info">
              <div className="user-info-name">{user?.username}</div>
              <div className="user-info-email">{user?.email}</div>
            </div>
          </div>
          <div className="user-menu-divider"></div>
          <button className="user-menu-item" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Iziet
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu

