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
          className="w-80 card"
          role="dialog"
          aria-label="Voice assistant"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">🎤 Voice Assistant</h2>
              <p className="mt-1 text-xs text-gray-500">
                Say commands like "dashboard" or "recorded lectures" to navigate.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setOpen(false)}
              aria-label="Close voice assistant"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-3">
            <p className="text-xs font-semibold text-purple-900 uppercase">Try saying:</p>
            <ul className="mt-2 space-y-1 text-sm text-purple-800">
              <li>📊 "dashboard" — go to your learning progress</li>
              <li>🎥 "live" — start a live class session</li>
              <li>📚 "lectures" — browse recorded lessons</li>
              <li>👨‍🏫 "teacher" — open teacher panel (if teacher)</li>
              <li>🚪 "logout" — sign out of your account</li>
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => a11y.setVoiceNavEnabled(!a11y.voiceNavEnabled)}
              aria-label="Toggle voice navigation"
            >
              {a11y.voiceNavEnabled ? '🔇 Disable Voice' : '🎤 Enable Voice'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => a11y.speak('Welcome to DIVYAM. Your accessible learning platform.')}
              aria-label="Speak help message"
            >
              🔊 Speak Help
            </button>
          </div>

          {!a11y.voiceSupported && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              ⚠️ Voice recognition is not supported in this browser. Try Chrome, Edge, or Firefox.
            </div>
          )}
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
