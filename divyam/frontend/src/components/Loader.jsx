import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-2xl border px-4 py-3"
      style={{ background: 'rgba(237,233,254,0.5)', borderColor: 'rgba(196,181,253,0.35)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="h-4 w-4 animate-spin rounded-full border-2"
        style={{ borderColor: 'rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6' }}
        aria-hidden="true"
      />
      <span className="text-sm font-medium" style={{ color: 'rgb(var(--color-muted))' }}>{label}</span>
    </div>
  )
}
