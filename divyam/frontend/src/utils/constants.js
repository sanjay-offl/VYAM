// Centralized constants for the DIVYAM frontend.
// Keep URLs and roles in one place for maintainability.

export const APP_NAME = 'DIVYAM'

export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LIVE: '/live',
  RECORDED: '/recorded',
  TEACHER: '/teacher',
}

export const STORAGE_KEYS = {
  TOKEN: 'divyam_token',
  USER: 'divyam_user',
  A11Y: 'divyam_a11y',
}

export const API_PATHS = {
  HEALTH: '/health',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/users/me',
  VIDEOS: '/videos',
  ANALYTICS: '/analytics/summary',
  AI_EMOTION: '/analytics/ai/emotion',
  AI_ENGAGEMENT: '/analytics/ai/engagement',
}
