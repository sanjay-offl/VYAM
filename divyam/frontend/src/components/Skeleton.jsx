import React from 'react'

/**
 * Skeleton — shimmer loading placeholder.
 * Variants: text, card, avatar, video, stat
 */
export default function Skeleton({ variant = 'text', count = 1, className = '' }) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="skeleton h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
      </div>
    )
  }

  if (variant === 'stat') {
    return (
      <div className={`flex gap-4 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="flex-1 rounded-2xl border p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.1)' }}
          >
            <div className="skeleton mx-auto h-5 w-5 rounded-full mb-3" />
            <div className="skeleton mx-auto h-8 w-16 rounded-lg mb-2" />
            <div className="skeleton mx-auto h-2.5 w-20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.1)' }}
          >
            <div className="skeleton h-4 w-3/4 rounded mb-3" />
            <div className="skeleton h-3 w-full rounded mb-2" />
            <div className="skeleton h-3 w-2/3 rounded mb-4" />
            <div className="skeleton h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'video') {
    return (
      <div className={className}>
        <div className="skeleton aspect-video w-full rounded-2xl mb-4" />
        <div className="flex gap-4">
          <div className="skeleton h-16 flex-1 rounded-2xl" />
          <div className="skeleton h-16 flex-[2] rounded-2xl" />
        </div>
      </div>
    )
  }

  // Default: text lines
  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((i) => (
        <div key={i} className="skeleton h-3 rounded" style={{ width: `${85 - i * 12}%` }} />
      ))}
    </div>
  )
}
