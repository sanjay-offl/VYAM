import { useEffect, useMemo, useRef } from 'react'
import useSpeech from './useSpeech.js'

// SpeechRecognition-based voice command listener.
// Emits a DOM event: `divyam:voice` with transcript text.

export default function useVoiceCommands({ enabled, ttsEnabled }) {
  const recRef = useRef(null)
  const { speak } = useSpeech({ enabled: Boolean(ttsEnabled) })

  const supported = useMemo(() => {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (recRef.current) {
        try {
          recRef.current.stop()
        } catch {
          // ignore
        }
      }
      recRef.current = null
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      speak('Voice navigation is not supported in this browser.')
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-IN'

    rec.onresult = (event) => {
      const last = event.results?.[event.results.length - 1]
      const transcript = last?.[0]?.transcript
      if (!transcript) return
      window.dispatchEvent(new CustomEvent('divyam:voice', { detail: transcript }))
    }

    rec.onerror = () => {
      // ignore
    }

    try {
      rec.start()
      recRef.current = rec
      speak('Voice navigation enabled. Say dashboard, live class, or recorded lectures.')
    } catch {
      // ignore
    }

    return () => {
      try {
        rec.stop()
      } catch {
        // ignore
      }
      recRef.current = null
    }
  }, [enabled, speak])

  return { supported }
}
