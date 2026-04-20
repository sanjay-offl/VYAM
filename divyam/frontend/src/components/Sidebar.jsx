import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Item({ to, label, description }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-2xl border px-4 py-3 focus:outline-none ${
          isActive
            ? 'border-gold/40 bg-gold/10'
            : 'border-white/10 bg-white/5 hover:bg-white/10'
        }`
      }
      aria-label={label}
    >
      <div className="text-sm font-medium text-text">{label}</div>
      <div className="mt-0.5 text-xs text-muted">{description}</div>
    </NavLink>
  )
}

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <nav aria-label="Sidebar" className="space-y-2">
      <div className="rounded-2xl border border-white/10 bg-surface/20 p-4 backdrop-blur">
        <div className="text-sm font-semibold text-text">Quick Actions</div>
        <div className="mt-1 text-xs text-muted">
          Keyboard friendly navigation for students.
        </div>
      </div>

      <Item to="/dashboard" label="Dashboard" description="Progress and recommendations" />
      <Item to="/live" label="Live Class" description="WebRTC video + chat" />
      <Item to="/recorded" label="Recorded Lectures" description="Player with speed and narration" />

      {user?.role === 'TEACHER' ? (
        <Item to="/teacher" label="Teacher Panel" description="Upload videos, homework, analytics" />
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-muted">
          Tip: Press <span className="text-text">Tab</span> to move across controls.
        </div>
      </div>
    </nav>
  )
}
