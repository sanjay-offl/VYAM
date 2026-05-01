import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * BottomNav — fixed bottom tab bar for mobile, authenticated users only.
 * Hidden on md+ screens where the Sidebar is visible.
 */
export default function BottomNav() {
  const { user } = useAuth()

  const tabs = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/live',      icon: '🎥', label: 'Live' },
    { to: '/recorded',  icon: '📚', label: 'Lectures' },
  ]

  if (user?.role === 'TEACHER') {
    tabs.push({ to: '/teacher', icon: '👨‍🏫', label: 'Teacher' })
  }

  return (
    <nav className="bottom-nav flex md:hidden" aria-label="Bottom navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
          aria-label={tab.label}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
