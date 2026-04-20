import React, { useEffect, useState } from 'react'
import useAccessibility from '../hooks/useAccessibility.js'

// VoiceAssistant: small iOS-style floating helper.
// It gives voice command hints and allows toggling voice navigation.

export default function VoiceAssistant() {
  const a11y = useAccessibility()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!a11y.voiceNavEnabled) return
    if (open) return
    // Announce once when enabled.
    a11y.speak('Voice assistant is ready. Say dashboard, live class, or recorded lectures.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a11y.voiceNavEnabled])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div
          className="w-80 rounded-2xl border border-white/10 bg-surface/40 p-4 backdrop-blur-md"
          role="dialog"
          aria-label="Voice assistant"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-text">Voice Assistant</div>
              <div className="mt-1 text-xs text-muted">
                Use voice commands for quick navigation.
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-sm text-text hover:bg-white/10 focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Close voice assistant"
            >
              Close
            </button>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-muted">Try saying:</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text">
              <li>dashboard</li>
              <li>live class</li>
              <li>recorded lectures</li>
              <li>teacher panel</li>
              <li>logout</li>
            </ul>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-gold/15 px-3 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
              onClick={() => a11y.setVoiceNavEnabled(!a11y.voiceNavEnabled)}
              aria-label="Toggle voice navigation"
            >
              {a11y.voiceNavEnabled ? 'Disable voice nav' : 'Enable voice nav'}
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
              onClick={() => a11y.speak('Welcome to DIVYAM. How can I help?')}
              aria-label="Speak help message"
            >
              Speak help
            </button>
          </div>

          {!a11y.voiceSupported ? (
            <div className="mt-3 text-xs text-muted">
              Voice recognition is not supported in this browser.
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-white/10 bg-gold/20 px-4 py-3 text-sm font-semibold text-text shadow-2xl backdrop-blur hover:bg-gold/25 focus:outline-none"
        aria-label="Toggle voice assistant"
      >
        Voice
      </button>
    </div>
  )
}
