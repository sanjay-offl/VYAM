import api from './api.js'
import { STORAGE_KEYS } from '../utils/constants.js'

// Auth service wraps API calls and local storage.

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN) || ''
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuth({ token, user }) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function register({ name, email, password, role }) {
  const res = await api.post('/auth/register', { name, email, password, role })
  return res.data
}

export async function me() {
  const res = await api.get('/users/me')
  return res.data
}
