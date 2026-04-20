import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface/30 px-4 py-3 backdrop-blur"
    >
      <div
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-gold"
        aria-hidden="true"
      />
      <span className="text-sm text-muted">{label}</span>
    </div>
  )
}
