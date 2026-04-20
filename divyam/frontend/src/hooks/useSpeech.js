import { useCallback } from 'react'

// Lightweight hook for browser Text-to-Speech.
// Uses SpeechSynthesis if available.

export default function useSpeech({ enabled = true, lang = 'en-IN' } = {}) {
  const speak = useCallback(
    (text, { interrupt = true, rate = 1, pitch = 1 } = {}) => {
      if (!enabled) return
      if (typeof window === 'undefined') return
      if (!('speechSynthesis' in window)) return

      const message = String(text || '').trim()
      if (!message) return

      try {
        if (interrupt) window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(message)
        utter.lang = lang
        utter.rate = rate
        utter.pitch = pitch
        window.speechSynthesis.speak(utter)
      } catch {
        // ignore
      }
    },
    [enabled, lang],
  )

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }, [])

  return { speak, stop }
}
