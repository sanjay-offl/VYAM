import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Login() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const canSubmit = useMemo(() => {
    return !!(form.email && form.password)
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    try {
      const result = await login({ email: form.email, password: form.password })
      if (result?.mode === 'mock') {
        setInfo('Backend not running — signed in using demo mode.')
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Authentication failed')
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-extrabold"
            style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#8B5CF6,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your DIVYAM account to continue learning.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-7 shadow-glass"
          style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(139,92,246,0.18)', backdropFilter: 'blur(16px)' }}
        >
          {/* Error */}
          {error ? (
            <div
              className="mb-4 rounded-xl border px-4 py-3 text-sm text-red-700"
              style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}
              role="alert"
            >
              ⚠️ {error}
            </div>
          ) : null}

          {/* Info */}
          {info ? (
            <div
              className="mb-4 rounded-xl border px-4 py-3 text-sm"
              style={{ background: 'rgba(196,181,253,0.15)', borderColor: 'rgba(196,181,253,0.4)', color: '#6D28D9' }}
              role="status"
            >
              ℹ️ {info}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-5" aria-label="Authentication form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                type="email"
                required
                aria-label="Email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                type="password"
                required
                aria-label="Password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="btn btn-primary w-full"
              aria-label="Login"
            >
              {isLoading ? 'Signing in…' : '→ Sign In'}
            </button>

            {isLoading ? <Loader label="Authenticating…" /> : null}

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              New here?{' '}
              <Link
                className="font-semibold"
                style={{ color: '#7C3AED' }}
                to="/register"
                aria-label="Go to register"
              >
                Create an account
              </Link>
            </p>
          </form>

          {/* Demo credentials */}
          <details
            className="mt-5 rounded-xl border"
            style={{ borderColor: 'rgba(196,181,253,0.3)', background: 'rgba(237,233,254,0.3)' }}
          >
            <summary
              className="cursor-pointer px-4 py-3 text-sm font-medium select-none"
              style={{ color: '#7C3AED' }}
            >
              🔑 Demo credentials
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm space-y-2">
              <div>
                <span className="font-medium text-gray-700">Student: </span>
                <code className="text-xs rounded px-1.5 py-0.5" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>student@divyam.local</code>
                <span className="text-gray-500"> / </span>
                <code className="text-xs rounded px-1.5 py-0.5" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>student123</code>
              </div>
              <div>
                <span className="font-medium text-gray-700">Teacher: </span>
                <code className="text-xs rounded px-1.5 py-0.5" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>teacher@divyam.local</code>
                <span className="text-gray-500"> / </span>
                <code className="text-xs rounded px-1.5 py-0.5" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>teacher123</code>
              </div>
            </div>
          </details>
        </div>
      </motion.div>
    </div>
  )
}
