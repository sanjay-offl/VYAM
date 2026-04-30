import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12 px-4">
      <div
        className="w-full max-w-md rounded-3xl border p-10 text-center shadow-glass"
        style={{ background: 'rgba(255,255,255,0.70)', borderColor: 'rgba(139,92,246,0.18)', backdropFilter: 'blur(16px)' }}
      >
        <div
          className="mb-4 text-7xl font-extrabold leading-none"
          style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          404
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Poppins,sans-serif' }}>
          Page Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn btn-primary"
          aria-label="Go back to home"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
