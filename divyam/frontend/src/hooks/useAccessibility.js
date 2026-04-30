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

export function voiceCommandToPath(command) {
  const c = String(command || '').toLowerCase().trim()
  if (!c) return null

  const map = [
    { match: ['home'], to: '/' },
    { match: ['dashboard', 'dash'], to: '/dashboard' },
    { match: ['live', 'live class', 'class'], to: '/live' },
    { match: ['recorded', 'lectures', 'recorded lectures', 'videos'], to: '/recorded' },
    { match: ['teacher', 'teacher panel', 'panel'], to: '/teacher' },
    { match: ['login', 'sign in'], to: '/login' },
    { match: ['register', 'sign up'], to: '/register' },
  ]

  const target = map.find((item) => item.match.some((m) => c.includes(m)))
  return target?.to || null
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
