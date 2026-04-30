import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Item({ to, label, description, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-2xl border p-4 transition-all duration-200 ${
          isActive
            ? 'border-lavender-300/60 bg-lavender-50/80 shadow-glass-sm'
            : 'border-transparent bg-white/40 hover:border-lavender-200/50 hover:bg-lavender-50/40 hover:scale-[1.02] hover:shadow-glass-sm'
        }`
      }
      aria-label={label}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl" aria-hidden="true">{icon}</span>}
        <div>
          <div className="text-sm font-semibold text-gray-800">{label}</div>
          <div className="mt-0.5 text-xs text-gray-500 leading-snug">{description}</div>
        </div>
      </div>
    </NavLink>
  )
}

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <nav aria-label="Sidebar navigation" className="space-y-3 sticky top-24">
      {/* Header Card */}
      <div
        className="rounded-2xl border p-4"
        style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(16px)' }}
      >
        <h2
          className="text-sm font-bold uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Navigation
        </h2>
        <p className="mt-1 text-xs text-gray-400 leading-snug">
          Keyboard friendly — press Tab to navigate.
        </p>
      </div>

      <Item to="/dashboard" icon="📊" label="Dashboard" description="Your progress and stats" />
      <Item to="/live"      icon="🎥" label="Live Classes" description="Real-time WebRTC classes" />
      <Item to="/recorded"  icon="📚" label="Lectures" description="Watch on-demand lessons" />

      {user?.role === 'TEACHER' && (
        <Item to="/teacher" icon="👨‍🏫" label="Teacher Panel" description="Manage uploads & analytics" />
      )}

      {/* Tip Card */}
      <div
        className="rounded-2xl border p-4"
        style={{ background: 'rgba(237,233,254,0.55)', borderColor: 'rgba(196,181,253,0.35)', backdropFilter: 'blur(8px)' }}
      >
        <p className="text-xs text-lavender-700 leading-relaxed">
          💡 <span className="font-semibold">Pro Tip:</span> Use voice commands — say{' '}
          <span className="font-medium">"dashboard"</span> to navigate with Voice Assistant!
        </p>
      </div>
    </nav>
  )
}
