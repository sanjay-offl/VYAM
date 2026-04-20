import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginApi, meApi, registerApi } from '../services/api.js'

const AuthContext = createContext(null)

const STORAGE_TOKEN = 'divyam_token'
const STORAGE_USER = 'divyam_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeAuth({ token, user }) {
  localStorage.setItem(STORAGE_TOKEN, token)
  localStorage.setItem(STORAGE_USER, JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem(STORAGE_TOKEN)
  localStorage.removeItem(STORAGE_USER)
}

function isMockToken(token) {
  return token?.startsWith('mock.')
}

function mockLogin({ email, password }) {
  const normalized = String(email || '').trim().toLowerCase()
  const pass = String(password || '')

  const demoUsers = [
    {
      email: 'student@divyam.local',
      password: 'student123',
      user: { id: 'stu-1', name: 'Demo Student', email: 'student@divyam.local', role: 'STUDENT' },
    },
    {
      email: 'teacher@divyam.local',
      password: 'teacher123',
      user: { id: 'tch-1', name: 'Demo Teacher', email: 'teacher@divyam.local', role: 'TEACHER' },
    },
  ]

  const match = demoUsers.find((u) => u.email === normalized && u.password === pass)
  if (!match) throw new Error('Invalid demo credentials')

  return {
    token: `mock.${btoa(`${match.user.email}:${Date.now()}`)}`,
    user: match.user,
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN) || '')
  const [user, setUser] = useState(() => readStoredUser())
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  async function refreshMe() {
    if (!token) return
    if (isMockToken(token)) return

    try {
      const data = await meApi()
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem(STORAGE_USER, JSON.stringify(data.user))
      }
    } catch {
      // ignore; API may be offline in prototype mode
    }
  }

  async function login({ email, password }) {
    setIsLoading(true)
    try {
      try {
        const data = await loginApi({ email, password })
        storeAuth({ token: data.token, user: data.user })
        setToken(data.token)
        setUser(data.user)
        return { ok: true, mode: 'api' }
      } catch {
        const demo = mockLogin({ email, password })
        storeAuth(demo)
        setToken(demo.token)
        setUser(demo.user)
        return { ok: true, mode: 'mock' }
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function register({ name, email, password, role }) {
    setIsLoading(true)
    try {
      const data = await registerApi({ name, email, password, role })
      storeAuth({ token: data.token, user: data.user })
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    clearAuth()
    setToken('')
    setUser(null)
  }

  useEffect(() => {
    const onExpired = () => logout()
    window.addEventListener('divyam:auth:expired', onExpired)
    return () => window.removeEventListener('divyam:auth:expired', onExpired)
  }, [])

  useEffect(() => {
    refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, isAuthenticated, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
