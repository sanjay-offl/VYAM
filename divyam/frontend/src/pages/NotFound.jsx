import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-text">Page not found</h1>
        <p className="mt-1 text-sm text-muted">
          The page you requested does not exist.
        </p>
      </header>

      <Link
        to="/"
        className="inline-flex rounded-xl border border-white/10 bg-gold/15 px-4 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
        aria-label="Go back to home"
      >
        Back to Home
      </Link>
    </div>
  )
}
