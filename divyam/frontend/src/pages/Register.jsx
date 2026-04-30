import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    return !!(form.name && form.email && form.password && form.role)
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
    <div className="flex min-h-[60vh] items-center justify-center py-8 px-4">
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
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Join DIVYAM as a student or teacher to access premium learning resources.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.28 }}
          className="rounded-2xl border p-7 shadow-glass"
          style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(139,92,246,0.18)', backdropFilter: 'blur(16px)' }}
        >
          {/* Error */}
          {error && (
            <div
              className="mb-5 rounded-xl border px-4 py-3 text-sm text-red-700"
              style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5" aria-label="Register form">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                type="text"
                required
                placeholder="Your full name"
                aria-label="Full name"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                type="email"
                required
                placeholder="name@example.com"
                aria-label="Email"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                type="password"
                required
                placeholder="••••••••"
                aria-label="Password"
                autoComplete="new-password"
              />
              <p className="mt-1.5 text-xs text-gray-400">At least 8 characters recommended.</p>
            </div>

            {/* Role */}
            <div className="form-group">
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                aria-label="Select role"
              >
                <option value={ROLES.STUDENT}>Student</option>
                <option value={ROLES.TEACHER}>Teacher</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="btn btn-primary w-full"
              aria-label="Create account"
            >
              {isLoading ? 'Creating Account…' : '✨ Create Account'}
            </button>

            {isLoading ? <Loader label="Creating your account…" /> : null}
          </form>

          {/* Login link */}
          <div
            className="mt-6 border-t pt-5 text-center"
            style={{ borderColor: 'rgba(196,181,253,0.3)' }}
          >
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                className="font-semibold"
                style={{ color: '#7C3AED' }}
                to="/login"
                aria-label="Go to login"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
