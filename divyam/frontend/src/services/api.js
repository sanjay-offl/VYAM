/**
 * DIVYAM API Service
 *
 * All functions attempt the real backend first.
 * If the backend is offline (502, 503, ECONNREFUSED, network error),
 * they fall back to MOCK_DATA so the app works fully in demo mode.
 *
 * When the Spring Boot backend is running at :8081 the Vite proxy
 * forwards /api/* automatically — no code change needed.
 */

import axios from 'axios'

// ── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 6000,        // fail fast so mock fallback feels instant
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('divyam_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    // If Netlify serves the index.html fallback for an API route, reject it so it triggers the Mock mode
    if (typeof res.data === 'string' && res.data.toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject({ response: { status: 503 }, message: 'Backend offline (served HTML fallback)' })
    }
    return res
  },
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('divyam_token')
      localStorage.removeItem('divyam_user')
      window.dispatchEvent(new Event('divyam:auth:expired'))
    }
    return Promise.reject(err)
  },
)

export default api

// ── Backend availability check ────────────────────────────────────────────────

/**
 * Returns true if the error means the backend is simply not running
 * (proxy 502/503/504, or a network-level connection refusal).
 */
function isOffline(err) {
  const status = err?.response?.status
  if (status === 502 || status === 503 || status === 504) return true
  if (!err?.response && err?.code) return true   // ERR_CONNECTION_REFUSED etc.
  return false
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK = {
  lectures: [
    {
      id: 'lec-1',
      title: 'Basics of Computers (Accessible Notes)',
      description: 'Keyboard shortcuts, screen reader navigation, and safe browsing practices for visually impaired learners.',
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      transcript: 'Today we learn screen reader friendly navigation, keyboard shortcuts, and safe browsing practices.',
    },
    {
      id: 'lec-2',
      title: 'Mathematics: Algebra Foundations',
      description: 'Step-by-step problem solving with structured notes and audio narration support.',
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      transcript: 'We cover variables, expressions, and step-by-step solving with clear structured notes.',
    },
    {
      id: 'lec-3',
      title: 'English: Listening & Comprehension',
      description: 'Audio-first learning, pronunciation practice, and comprehension exercises.',
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      transcript: 'In this session we practice listening comprehension and pronunciation with audio feedback.',
    },
    {
      id: 'lec-4',
      title: 'Science: Forces and Motion',
      description: 'Tactile learning concepts: gravity, friction, and Newton\'s laws explained simply.',
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      transcript: 'We explore gravity, friction, and Newton\'s laws using hands-on descriptions.',
    },
  ],

  analytics: {
    completedLectures: 3,
    minutesWatched: 68,
    engagementScore: 0.76,
    lastActive: new Date().toISOString(),
    streak: 5,
    totalLectures: 4,
  },
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function apiHealth() {
  const res = await api.get('/health')
  return res.data
}

export async function loginApi({ email, password }) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function registerApi({ name, email, password, role }) {
  const res = await api.post('/auth/register', { name, email, password, role })
  return res.data
}

export async function meApi() {
  const res = await api.get('/users/me')
  return res.data
}

export async function listLecturesApi() {
  try {
    const res = await api.get('/videos')
    return res.data
  } catch (err) {
    if (isOffline(err)) {
      return { lectures: MOCK.lectures, source: 'mock' }
    }
    throw err
  }
}

export async function uploadLectureApi(formData) {
  try {
    const res = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (err) {
    if (isOffline(err)) {
      // Simulate success in demo mode
      return {
        id: `lec-mock-${Date.now()}`,
        message: 'Demo mode: upload recorded locally (backend offline).',
        source: 'mock',
      }
    }
    throw err
  }
}

export async function analyticsApi() {
  try {
    const res = await api.get('/analytics/summary')
    return res.data
  } catch (err) {
    if (isOffline(err)) {
      return { summary: MOCK.analytics, source: 'mock' }
    }
    throw err
  }
}

export async function aiEmotionApi(payload) {
  try {
    const res = await api.post('/analytics/ai/emotion', payload)
    return res.data
  } catch (err) {
    if (isOffline(err)) {
      return { emotion: 'neutral', confidence: 0.0, source: 'mock' }
    }
    throw err
  }
}

export async function aiEngagementApi(payload) {
  try {
    const res = await api.post('/analytics/ai/engagement', payload)
    return res.data
  } catch (err) {
    if (isOffline(err)) {
      return { engagementScore: MOCK.analytics.engagementScore, source: 'mock' }
    }
    throw err
  }
}
