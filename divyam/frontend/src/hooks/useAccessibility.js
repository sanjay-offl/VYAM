import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from '../utils/constants.js'
import useSpeech from './useSpeech.js'
import useVoiceCommands from './useVoiceCommands.js'

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

const defaultState = {
  highContrast: false,
  ttsEnabled: true,
  narrationEnabled: false,
  voiceNavEnabled: false,
  fontScale: 1,
}

let currentState = (() => {
  const stored = safeParse(localStorage.getItem(STORAGE_KEYS.A11Y) || '')
  return { ...defaultState, ...(stored || {}) }
})()

const listeners = new Set()

function emitChange() {
  for (const l of listeners) l()
}

function applySideEffects(next) {
  const root = document.documentElement
  if (next.highContrast) root.classList.add('high-contrast')
  else root.classList.remove('high-contrast')
  root.style.setProperty('--a11y-font-scale', String(next.fontScale))
}

function persist(next) {
  currentState = next
  localStorage.setItem(STORAGE_KEYS.A11Y, JSON.stringify(next))
  applySideEffects(next)
  emitChange()
}

/**
 * Voice command → route path mapping.
 *
 * Rules are ordered from most-specific to least-specific so that
 * "go to live class" matches "/live" before "class" alone could
 * accidentally match something else. Each rule uses `includes()`
 * for flexible matching ("open dashboard", "go to dashboard", etc.).
 *
 * A cooldown ref in VoiceNavBridge prevents duplicate triggers.
 */
const VOICE_ROUTES = [
  // Multi-word phrases first (most specific)
  { keywords: ['live class'],            to: '/live' },
  { keywords: ['recorded lectures'],     to: '/recorded' },
  { keywords: ['teacher panel'],         to: '/teacher' },
  { keywords: ['sign in'],              to: '/login' },
  { keywords: ['sign up'],              to: '/register' },
  { keywords: ['log out'],              to: '__logout__' },

  // Single keywords (less specific)
  { keywords: ['dashboard', 'dash board'], to: '/dashboard' },
  { keywords: ['live'],                   to: '/live' },
  { keywords: ['recorded', 'lectures', 'videos'], to: '/recorded' },
  { keywords: ['teacher', 'panel'],       to: '/teacher' },
  { keywords: ['login'],                 to: '/login' },
  { keywords: ['register'],              to: '/register' },
  { keywords: ['logout'],                to: '__logout__' },
  { keywords: ['home'],                  to: '/' },
]

/**
 * Returns a human-readable label for the matched route (used for TTS + UI).
 */
const ROUTE_LABELS = {
  '/':          'Home',
  '/dashboard': 'Dashboard',
  '/live':      'Live Class',
  '/recorded':  'Recorded Lectures',
  '/teacher':   'Teacher Panel',
  '/login':     'Login',
  '/register':  'Register',
  __logout__:   'Logging out',
}

export function voiceCommandToPath(command) {
  const c = String(command || '').toLowerCase().trim()
  if (!c) return null

  // Strip common prefixes so "go to dashboard" ⇒ still matches "dashboard"
  // (already handled by includes, but this note explains the design)

  for (const rule of VOICE_ROUTES) {
    if (rule.keywords.some((kw) => c.includes(kw))) {
      return rule.to
    }
  }

  return null
}

export function getRouteLabel(path) {
  return ROUTE_LABELS[path] || null
}

function setHighContrast(highContrast) {
  persist({ ...currentState, highContrast: Boolean(highContrast) })
}

function setTtsEnabled(ttsEnabled) {
  persist({ ...currentState, ttsEnabled: Boolean(ttsEnabled) })
}

function setNarrationEnabled(narrationEnabled) {
  persist({ ...currentState, narrationEnabled: Boolean(narrationEnabled) })
}

function setFontScale(fontScale) {
  const clamped = Math.max(0.9, Math.min(1.4, Number(fontScale) || 1))
  persist({ ...currentState, fontScale: clamped })
}

function setVoiceNavEnabled(voiceNavEnabled) {
  persist({ ...currentState, voiceNavEnabled: Boolean(voiceNavEnabled) })
}

export default function useAccessibility() {
  const state = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => currentState,
    () => defaultState,
  )

  const { speak, stop } = useSpeech({ enabled: state.ttsEnabled })
  const { supported: voiceSupported, listening: voiceListening, voiceError } = useVoiceCommands({
    enabled: state.voiceNavEnabled,
    ttsEnabled: state.ttsEnabled,
  })

  useEffect(() => {
    // Apply settings on first mount as well.
    applySideEffects(currentState)
  }, [])

  const api = useMemo(
    () => ({
      ...state,
      voiceSupported,
      voiceListening,
      voiceError,
      setHighContrast,
      setTtsEnabled,
      setNarrationEnabled,
      setVoiceNavEnabled,
      setFontScale,
      speak,
      stopSpeaking: stop,
    }),
    [state, voiceSupported, voiceListening, voiceError, speak, stop],
  )

  return api
}
