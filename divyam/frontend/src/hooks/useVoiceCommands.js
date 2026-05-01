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

  const [listening, setListening]   = useState(false)
  const [voiceError, setVoiceError] = useState('')

  // Refs — don't trigger re-renders
  const shouldRestart  = useRef(false)   // true = keep the mic alive
  const activeRec      = useRef(null)    // current recognition instance
  const restartTimer   = useRef(null)    // debounce timer
  const startedOnce    = useRef(false)   // suppress duplicate "enabled" announcement

  const clearTimer = useCallback(() => {
    if (restartTimer.current) {
      clearTimeout(restartTimer.current)
      restartTimer.current = null
    }
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
  }, [clearTimer])

  /** Create and start a brand-new recognition instance */
  const startNew = useCallback(() => {
    clearTimer()

    if (!shouldRestart.current) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    // Abort any lingering instance first
    const prev = activeRec.current
    if (prev) {
      try { prev.abort() } catch { /* ignore */ }
    }

    const rec = new SR()
    rec.continuous      = true
    rec.interimResults  = false
    rec.lang            = 'en-IN'
    rec.maxAlternatives = 3
    activeRec.current   = rec

    rec.onstart = () => {
      if (activeRec.current !== rec) return // stale instance
      console.log('[DIVYAM Voice] 🎙️ Recognition started')
      setListening(true)
      setVoiceError('')
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

        console.log(`[DIVYAM Voice] 📝 Heard: "${text}"`)

        // Dispatch to all listeners (VoiceNavBridge + VoiceAssistant UI)
        window.dispatchEvent(new CustomEvent('divyam:voice', { detail: text }))
      }
    }

    rec.onerror = (event) => {
      if (activeRec.current !== rec) return // stale instance

      const code = event?.error || 'unknown'
      console.warn(`[DIVYAM Voice] ⚠️ Error: ${code}`)

      if (code === 'not-allowed' || code === 'permission-denied') {
        const msg = 'Microphone access denied. Please allow microphone permission in your browser settings and try again.'
        shouldRestart.current = false
        setVoiceError(msg)
        setListening(false)
        speak(msg)
        return // Don't restart — needs user intervention
      }

      if (code === 'network') {
        const msg = 'Voice recognition requires an internet connection.'
        shouldRestart.current = false
        setVoiceError(msg)
        setListening(false)
        speak(msg)
        return
      }

      if (code === 'no-speech' || code === 'audio-capture') {
        // Transient — let onend handle restart
        return
      }

      if (code === 'aborted') {
        // Intentional — do nothing
        return
      }

      // Other errors — surface but still allow restart
      setVoiceError(`Voice error: ${code}`)
    }

    rec.onend = () => {
      if (activeRec.current !== rec) return // stale instance

      activeRec.current = null
      console.log('[DIVYAM Voice] 🔄 Recognition ended, restarting…')

      // Restart only if we're still supposed to be listening
      if (shouldRestart.current) {
        // Do NOT setListening(false) here so the UI doesn't flicker to 'Starting...'
        restartTimer.current = setTimeout(startNew, 200)
      } else {
        setListening(false)
      }
    }

    try {
      rec.start()
    } catch (err) {
      console.warn('[DIVYAM Voice] ⚠️ Start failed:', err.message)
      // e.g. InvalidStateError — discard this instance, schedule retry
      activeRec.current = null
      if (shouldRestart.current) {
        restartTimer.current = setTimeout(startNew, 400)
      } else {
        setListening(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer, speak])

  // ── Main effect: react to enabled toggle ─────────────────
  useEffect(() => {
    if (!enabled) {
      stopNow()
      startedOnce.current = false
      return
    }

    if (!supported) {
      setVoiceError('Voice recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    shouldRestart.current = true
    setVoiceError('')

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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, supported])

  return { supported, listening, voiceError }
}
