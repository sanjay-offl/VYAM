import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Login() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const canSubmit = useMemo(() => {
    if (!form.email || !form.password) return false
    return true
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
    <div className="mx-auto max-w-xl">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-text">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Accessible authentication with Student/Teacher roles.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {error ? (
          <div
            className="mb-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-text"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {info ? (
          <div
            className="mb-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-text"
            role="status"
          >
            {info}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" aria-label="Authentication form">
          <label className="block">
            <span className="text-sm text-text">Email</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              type="email"
              required
              aria-label="Email"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm text-text">Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              type="password"
              required
              aria-label="Password"
              autoComplete="current-password"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="rounded-xl border border-white/10 bg-gold/15 px-4 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none disabled:opacity-50"
              aria-label="Login"
            >
              Login
            </button>
            {isLoading ? <Loader label="Authenticating…" /> : null}
          </div>

          <div className="text-sm text-muted">
            New here?{' '}
            <Link className="text-text underline" to="/register" aria-label="Go to register">
              Create an account
            </Link>
          </div>

          <details className="rounded-xl border border-white/10 bg-surface/20 px-4 py-3">
            <summary className="cursor-pointer text-sm text-text">Demo credentials</summary>
            <div className="mt-2 text-sm text-muted">
              <div>
                Student: <span className="text-text">student@divyam.local</span> /{' '}
                <span className="text-text">student123</span>
              </div>
              <div className="mt-1">
                Teacher: <span className="text-text">teacher@divyam.local</span> /{' '}
                <span className="text-text">teacher123</span>
              </div>
            </div>
          </details>
        </form>
      </div>
    </div>
  )
}
