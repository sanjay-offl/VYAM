import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
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
  (res) => res,
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
  const res = await api.get('/videos')
  return res.data
}

export async function uploadLectureApi(formData) {
  const res = await api.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export async function analyticsApi() {
  const res = await api.get('/analytics/summary')
  return res.data
}
