import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSpeech from './useSpeech.js'

/**
 * useVoiceCommands
 *
 * Keeps the mic continuously open by creating a fresh SpeechRecognition
 * instance on every restart. This avoids the InvalidStateError that occurs
 * when calling .start() on an already-ended recognizer.
 *
 * Key decisions:
 *  - shouldRestart ref: single source-of-truth for "keep running"
 *  - new SpeechRecognition() on each start (never reuse old instances)
 *  - debounced restart (200ms) to prevent tight loops on rapid onend
 *  - not-allowed / network errors: stop cycling, surface to UI
 *  - Fires 'divyam:voice' CustomEvent with the final transcript for
 *    downstream consumers (VoiceNavBridge, VoiceAssistant UI)
 */
export default function useVoiceCommands({ enabled, ttsEnabled }) {
  const { speak } = useSpeech({ enabled: Boolean(ttsEnabled) })

  const supported = useMemo(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  )

  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [status, setStatus] = useState('off')

  // Refs — don't trigger re-renders
  const shouldRestart = useRef(false)   // true = keep the mic alive
  const activeRec = useRef(null)        // current recognition instance
  const restartTimer = useRef(null)     // debounce timer
  const startedOnce = useRef(false)     // suppress duplicate "enabled" announcement
  const mountedRef = useRef(false)
  const lastRestartAt = useRef(0)
  const lastUserGestureAt = useRef(Date.now())
  const visibilityRef = useRef(!document.hidden)
  const focusRef = useRef(typeof document.hasFocus === 'function' ? document.hasFocus() : true)
  const statusRef = useRef('off')
  const processingTimer = useRef(null)
  const endBurstCount = useRef(0)
  const lastEndAt = useRef(0)
  const isMobile = useRef(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent))

  const clearTimer = useCallback(() => {
    if (restartTimer.current) {
      clearTimeout(restartTimer.current)
      restartTimer.current = null
    }
    if (processingTimer.current) {
      clearTimeout(processingTimer.current)
      processingTimer.current = null
    }
  }, [])

  const setStatusSafe = useCallback((next) => {
    if (statusRef.current === next) return
    statusRef.current = next
    setStatus(next)
  }, [])

  /** Tear down the current instance without scheduling a restart */
  const stopNow = useCallback(() => {
    shouldRestart.current = false
    clearTimer()
    const rec = activeRec.current
    activeRec.current = null
    if (rec) {
      try { rec.abort() } catch { /* ignore */ }
    }
    setListening(false)
    setStatusSafe('off')
  }, [clearTimer, setStatusSafe])

  const canStartNow = useCallback(() => {
    if (!mountedRef.current) return false
    if (!shouldRestart.current) return false
    if (!visibilityRef.current) return false
    if (!focusRef.current) return false

    if (isMobile.current && Date.now() - lastUserGestureAt.current > 30000) {
      setStatusSafe('paused')
      setVoiceError('Tap to resume voice recognition.')
      return false
    }

    return true
  }, [setStatusSafe])

  const scheduleRestart = useCallback((delayMs) => {
    if (!canStartNow()) return
    if (restartTimer.current) return
    setStatusSafe('reconnecting')
    restartTimer.current = setTimeout(() => {
      restartTimer.current = null
      if (canStartNow()) startNew()
    }, delayMs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStartNow, setStatusSafe])

  const resume = useCallback(() => {
    if (!supported) return
    lastUserGestureAt.current = Date.now()
    setVoiceError('')
    if (!shouldRestart.current) shouldRestart.current = true
    setStatusSafe('starting')
    scheduleRestart(isMobile.current ? 900 : 300)
  }, [scheduleRestart, setStatusSafe, supported])

  /** Create and start a brand-new recognition instance */
  const startNew = useCallback(() => {
    clearTimer()

    if (!canStartNow()) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    // Abort any lingering instance first
    const prev = activeRec.current
    if (prev) {
      try { prev.abort() } catch { /* ignore */ }
    }

    const rec = new SR()
    rec.continuous = !isMobile.current
    rec.interimResults = true
    rec.lang            = 'en-IN'
    rec.maxAlternatives = 3
    activeRec.current   = rec
    setStatusSafe('starting')

    rec.onstart = () => {
      if (activeRec.current !== rec) return // stale instance
      setListening(true)
      setVoiceError('')
      setStatusSafe('listening')
    }

    rec.onresult = (event) => {
      if (activeRec.current !== rec) return // stale instance

      // Process only the latest final result
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result.isFinal) continue

        // Try all alternatives for better Indian-English accuracy
        const transcript =
          result?.[0]?.transcript ||
          result?.[1]?.transcript ||
          result?.[2]?.transcript || ''

        const text = transcript.trim()
        if (!text) continue

        // Dispatch to all listeners (VoiceNavBridge + VoiceAssistant UI)
        window.dispatchEvent(new CustomEvent('divyam:voice', { detail: text }))

        setStatusSafe('processing')
        if (processingTimer.current) clearTimeout(processingTimer.current)
        processingTimer.current = setTimeout(() => {
          if (shouldRestart.current) setStatusSafe('listening')
        }, 800)
      }
    }

    rec.onerror = (event) => {
      if (activeRec.current !== rec) return // stale instance

      const code = event?.error || 'unknown'

      if (code === 'not-allowed' || code === 'permission-denied') {
        const msg = 'Microphone access denied. Please allow microphone permission in your browser settings and try again.'
        shouldRestart.current = false
        setVoiceError(msg)
        setListening(false)
        setStatusSafe('permission')
        speak(msg)
        return // Don't restart — needs user intervention
      }

      if (code === 'network') {
        const msg = 'Voice recognition requires an internet connection.'
        shouldRestart.current = false
        setVoiceError(msg)
        setListening(false)
        setStatusSafe('error')
        speak(msg)
        return
      }

      if (code === 'no-speech' || code === 'audio-capture') {
        // Transient — let onend handle restart with cooldown
        return
      }

      if (code === 'aborted') {
        // Intentional — do nothing
        return
      }

      // Other errors — surface but still allow restart
      setVoiceError(`Voice error: ${code}`)
      setStatusSafe('error')
    }

    rec.onend = () => {
      if (activeRec.current !== rec) return // stale instance

      activeRec.current = null

      const now = Date.now()
      if (now - lastEndAt.current < 900) {
        endBurstCount.current += 1
      } else {
        endBurstCount.current = 0
      }
      lastEndAt.current = now

      // Restart only if we're still supposed to be listening
      if (shouldRestart.current) {
        // Do NOT setListening(false) here so the UI doesn't flicker to 'Starting...'
        const delay = isMobile.current ? 1200 : 500
        const backoff = endBurstCount.current > 2 ? 2500 : delay
        scheduleRestart(backoff)
      } else {
        setListening(false)
        setStatusSafe('paused')
      }
    }

    try {
      rec.start()
      lastRestartAt.current = Date.now()
    } catch (err) {
      // e.g. InvalidStateError — discard this instance, schedule retry
      activeRec.current = null
      if (shouldRestart.current) {
        scheduleRestart(isMobile.current ? 1400 : 700)
      } else {
        setListening(false)
        setStatusSafe('paused')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStartNow, clearTimer, scheduleRestart, setStatusSafe, speak])

  // ── Main effect: react to enabled toggle ─────────────────
  useEffect(() => {
    mountedRef.current = true

    const onVisibility = () => {
      visibilityRef.current = !document.hidden
      if (!visibilityRef.current) {
        setStatusSafe('paused')
      } else if (shouldRestart.current) {
        scheduleRestart(isMobile.current ? 1200 : 500)
      }
    }

    const onFocus = () => {
      focusRef.current = true
      if (shouldRestart.current) scheduleRestart(isMobile.current ? 1200 : 500)
    }

    const onBlur = () => {
      focusRef.current = false
      setStatusSafe('paused')
    }

    const onGesture = () => {
      lastUserGestureAt.current = Date.now()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    window.addEventListener('touchstart', onGesture, { passive: true })

    return () => {
      mountedRef.current = false
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
      window.removeEventListener('touchstart', onGesture)
    }
  }, [scheduleRestart, setStatusSafe])

  useEffect(() => {
    if (!enabled) {
      stopNow()
      startedOnce.current = false
      return
    }

    if (!supported) {
      setVoiceError('Voice recognition is not supported in this browser. Please use Chrome or Edge.')
      setStatusSafe('unsupported')
      return
    }

    shouldRestart.current = true
    setVoiceError('')
    setStatusSafe('starting')

    if (!startedOnce.current) {
      startedOnce.current = true
      speak('Voice navigation enabled. Say dashboard, live class, or recorded lectures.')
    }

    startNew()

    return () => {
      // Component unmount / enabled flipped off — clean up without restart
      shouldRestart.current = false
      clearTimer()
      const rec = activeRec.current
      activeRec.current = null
      if (rec) {
        try { rec.abort() } catch { /* ignore */ }
      }
      setListening(false)
      setStatusSafe('off')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, supported, clearTimer, setStatusSafe, startNew, stopNow])

  return { supported, listening, voiceError, status, resume }
}
