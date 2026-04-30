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
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600">
            Join DIVYAM as a student or teacher to access premium learning resources.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="card card-glow"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5" aria-label="Register form">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                className="input mt-2"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                type="text"
                required
                placeholder="John Doe"
                aria-label="Full name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <input
                className="input mt-2"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                type="email"
                required
                placeholder="name@example.com"
                aria-label="Email"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                className="input mt-2"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                type="password"
                required
                placeholder="••••••••"
                aria-label="Password"
                autoComplete="new-password"
              />
              <p className="mt-2 text-xs text-gray-500">At least 8 characters recommended</p>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-900">
                Role
              </label>
              <select
                className="input mt-2"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                aria-label="Select role"
              >
                <option value={ROLES.STUDENT}>Student</option>
                <option value={ROLES.TEACHER}>Teacher</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="btn btn-primary w-full"
              aria-label="Create account"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-purple-200 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link className="font-semibold text-purple-600 hover:text-purple-700" to="/login" aria-label="Go to login">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
