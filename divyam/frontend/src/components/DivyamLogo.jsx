import React from 'react'

/**
 * DIVYAM Logo — Eye with "D" inside
 * Inline SVG for crisp rendering at any size.
 * Uses the brand purple palette (#8B5CF6 / #C4B5FD).
 *
 * @param {number}  size      - Width/height in px (default 40)
 * @param {boolean} gradient  - Use gradient fill (default true)
 * @param {string}  className - Extra Tailwind/CSS classes
 */
export default function DivyamLogo({ size = 40, gradient = true, className = '' }) {
  const id = React.useId()
  const gradId = `logo-grad-${id}`

  return (
    <svg
      width={size}
      height={size * 0.56} // aspect ratio ~1:0.56 (eye shape)
      viewBox="0 0 180 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      )}

      {/* Outer eye shape */}
      <path
        d="M90 8C50 8 18 36 4 50c14 14 46 42 86 42s72-28 86-42C162 36 130 8 90 8Z"
        stroke={gradient ? `url(#${gradId})` : 'currentColor'}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner circle (iris) */}
      <circle
        cx="90"
        cy="50"
        r="24"
        stroke={gradient ? `url(#${gradId})` : 'currentColor'}
        strokeWidth="5"
        fill="none"
      />

      {/* "D" letterform inside the iris */}
      <path
        d="M82 36v28M82 36h6c8 0 14 6 14 14s-6 14-14 14h-6"
        stroke={gradient ? `url(#${gradId})` : 'currentColor'}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
