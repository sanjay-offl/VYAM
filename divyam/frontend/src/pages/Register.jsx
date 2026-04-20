import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'
import { ROLES } from '../utils/constants.js'

export default function Register() {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
  })
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    if (!form.name || !form.email || !form.password || !form.role) return false
    return true
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Registration failed')
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-text">Create account</h1>
        <p className="mt-1 text-sm text-muted">
          Register as Student or Teacher (role-based access).
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

        <form onSubmit={onSubmit} className="space-y-4" aria-label="Register form">
          <label className="block">
            <span className="text-sm text-text">Full name</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              type="text"
              required
              aria-label="Full name"
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
            />
          </label>

          <label className="block">
            <span className="text-sm text-text">Role</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              aria-label="Select role"
            >
              <option value={ROLES.STUDENT}>Student</option>
              <option value={ROLES.TEACHER}>Teacher</option>
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="rounded-xl border border-white/10 bg-gold/15 px-4 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none disabled:opacity-50"
              aria-label="Create account"
            >
              Create account
            </button>
            {isLoading ? <Loader label="Creating…" /> : null}
          </div>

          <div className="text-sm text-muted">
            Already have an account?{' '}
            <Link className="text-text underline" to="/login" aria-label="Go to login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
