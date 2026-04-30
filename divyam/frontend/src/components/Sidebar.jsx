import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Item({ to, label, description }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `card transition-all duration-200 ${
          isActive
            ? 'border-purple-300 bg-purple-50 shadow-md'
            : 'border-purple-100 hover:border-purple-200 hover:shadow-sm'
        }`
      }
      aria-label={label}
    >
      <div className="font-medium text-gray-900">{label}</div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
    </NavLink>
  )
}

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <nav aria-label="Sidebar navigation" className="space-y-3">
      <div className="card">
        <h2 className="font-semibold text-gray-900">Navigation</h2>
        <p className="mt-1 text-xs text-gray-500">
          Keyboard friendly — press Tab to navigate through options.
        </p>
      </div>

      <Item to="/dashboard" label="📊 Dashboard" description="Your progress and stats" />
      <Item to="/live" label="🎥 Live Classes" description="Real-time WebRTC classes" />
      <Item to="/recorded" label="📚 Lectures" description="Watch on-demand lessons" />

      {user?.role === 'TEACHER' && (
        <Item to="/teacher" label="👨‍🏫 Teacher Panel" description="Manage uploads & analytics" />
      )}

      <div className="card bg-purple-50 text-purple-900">
        <p className="text-sm">
          💡 <span className="font-medium">Pro Tip:</span> Use voice commands — say "dashboard" to navigate with Voice Assistant!
        </p>
      </div>
    </nav>
  )
}
