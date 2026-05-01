import React, { useEffect, useState } from 'react'
import useAccessibility from '../hooks/useAccessibility.js'

/**
 * VoiceAssistant
 * - Desktop: floating glass card, bottom-right, clears BottomNav
 * - Mobile: bottom sheet modal that slides up
 * - Mic pulse animation while listening
 */
export default function VoiceAssistant() {
  const a11y = useAccessibility()
  const [open, setOpen] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
  const [lastAction, setLastAction] = useState('')
  const clearTimer = React.useRef(null)

  // Use mobile breakpoint to switch between float vs bottom sheet
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Announce when voice is first enabled
  useEffect(() => {
    if (!a11y.voiceNavEnabled) return
    if (open) return
    a11y.speak('Voice assistant is ready. Say dashboard, live class, or recorded lectures.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a11y.voiceNavEnabled])

  // Listen for voice events to show transcript + action feedback
  useEffect(() => {
    if (!a11y.voiceNavEnabled) return

    const onVoice = (e) => {
      const transcript = e?.detail || ''
      setLastTranscript(transcript)

      const lower = transcript.toLowerCase()
      if (lower.includes('logout') || lower.includes('log out')) {
        setLastAction('Logging out…')
      } else if (lower.includes('dashboard') || lower.includes('dash')) {
        setLastAction('Going to Dashboard')
      } else if (lower.includes('live') || lower.includes('class')) {
        setLastAction('Opening Live Class')
      } else if (lower.includes('recorded') || lower.includes('lectures') || lower.includes('videos')) {
        setLastAction('Opening Recorded Lectures')
      } else if (lower.includes('teacher') || lower.includes('panel')) {
        setLastAction('Opening Teacher Panel')
      } else if (lower.includes('home')) {
        setLastAction('Going to Home')
      } else if (lower.includes('login') || lower.includes('sign in')) {
        setLastAction('Going to Login')
      } else if (lower.includes('register') || lower.includes('sign up')) {
        setLastAction('Going to Register')
      } else {
        setLastAction('Command not recognized')
      }

      if (clearTimer.current) clearTimeout(clearTimer.current)
      clearTimer.current = setTimeout(() => {
        setLastTranscript('')
        setLastAction('')
      }, 4000)
    }

    window.addEventListener('divyam:voice', onVoice)
    return () => window.removeEventListener('divyam:voice', onVoice)
  }, [a11y.voiceNavEnabled])

  // Mic status indicator
  const micStatus = !a11y.voiceNavEnabled
    ? { color: '#9CA3AF', label: 'Off' }
    : a11y.voiceError
    ? { color: '#EF4444', label: 'Error' }
    : a11y.voiceListening
    ? { color: '#22C55E', label: 'Listening…' }
    : { color: '#F59E0B', label: 'Starting…' }

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const panelContent = (
    <>
      {/* Handle (mobile bottom sheet) */}
      {isMobile && <div className="bottom-sheet-handle" />}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
            🎤 Voice Assistant
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 leading-snug">
            Say commands to navigate hands-free.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm shrink-0"
          onClick={() => setOpen(false)}
          aria-label="Close voice assistant"
        >
          ✕
        </button>
      </div>

      {/* Mic Status Badge */}
      <div
        className="mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5"
        style={{ background: 'rgba(250,250,255,0.7)', borderColor: 'rgba(139,92,246,0.15)' }}
        aria-live="polite"
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{
            background: micStatus.color,
            boxShadow: a11y.voiceListening ? `0 0 8px ${micStatus.color}` : 'none',
            animation: a11y.voiceListening ? 'pulseSoft 1.5s ease-in-out infinite' : 'none',
          }}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold" style={{ color: micStatus.color }}>
          {micStatus.label}
        </span>
        {a11y.voiceNavEnabled && (
          <span className="ml-auto text-xs text-gray-400">
            {a11y.voiceSupported ? 'Browser: ✓' : 'Browser: ✗'}
          </span>
        )}
      </div>

      {/* Error message */}
      {a11y.voiceError && (
        <div
          className="mt-3 rounded-xl border px-3 py-2 text-xs text-red-700"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}
          role="alert"
        >
          ⚠️ {a11y.voiceError}
        </div>
      )}

      {/* Live transcript feedback */}
      {lastTranscript && (
        <div
          className="mt-3 rounded-xl border px-3 py-2.5"
          style={{ background: 'rgba(237,233,254,0.6)', borderColor: 'rgba(196,181,253,0.4)' }}
          aria-live="assertive"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-lavender-500 mb-1">
            Heard:
          </div>
          <div className="text-sm text-gray-800 font-medium">"{lastTranscript}"</div>
          {lastAction && (
            <div className="mt-1 text-xs font-semibold" style={{ color: '#8B5CF6' }}>
              → {lastAction}
            </div>
          )}
        </div>
      )}

      {/* Command list */}
      <div
        className="mt-4 rounded-xl border p-3"
        style={{ background: 'rgba(237,233,254,0.5)', borderColor: 'rgba(196,181,253,0.35)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#8B5CF6' }}>
          Supported commands:
        </p>
        <ul className="space-y-1.5 text-xs text-gray-700">
          <li><span className="font-medium text-gray-500">📊</span> "dashboard" or "go to dashboard"</li>
          <li><span className="font-medium text-gray-500">🎥</span> "live" or "live class"</li>
          <li><span className="font-medium text-gray-500">📚</span> "lectures" or "recorded"</li>
          <li><span className="font-medium text-gray-500">👨‍🏫</span> "teacher" or "teacher panel"</li>
          <li><span className="font-medium text-gray-500">🏠</span> "home"</li>
          <li><span className="font-medium text-gray-500">🚪</span> "logout"</li>
        </ul>
      </div>

      {/* Actions */}
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
          🔊 Test TTS
        </button>
      </div>

      {/* Browser not supported warning */}
      {!a11y.voiceSupported && (
        <div
          className="mt-3 rounded-xl border px-3 py-2 text-xs text-red-700"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}
          role="alert"
        >
          ⚠️ Voice recognition not supported. Please use Chrome, Edge, or Safari.
        </div>
      )}

      {/* Microphone permission hint */}
      {a11y.voiceNavEnabled && !a11y.voiceListening && !a11y.voiceError && a11y.voiceSupported && (
        <p className="mt-3 text-[10px] text-gray-400 text-center">
          If the mic doesn't start, check browser microphone permissions.
        </p>
      )}
    </>
  )

  return (
    <>
      {/* Panel — Bottom Sheet on mobile, floating card on desktop */}
      {open && (
        <>
          {/* Mobile: bottom sheet with overlay */}
          {isMobile ? (
            <>
              <div
                className="bottom-sheet-overlay animate-fade-in"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div
                className="bottom-sheet animate-slide-up"
                role="dialog"
                aria-label="Voice assistant"
                aria-live="polite"
              >
                {panelContent}
              </div>
            </>
          ) : (
            /* Desktop: floating glass card */
            <div
              className="fixed bottom-24 right-5 z-50 w-80 rounded-2xl border p-5 shadow-glass-lg animate-scale-in"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(139,92,246,0.2)',
              }}
              role="dialog"
              aria-label="Voice assistant"
              aria-live="polite"
            >
              {panelContent}
            </div>
          )}
        </>
      )}

      {/* FAB — positioned above BottomNav on mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:scale-105 hover:shadow-glow-lg focus:outline-none"
        style={{
          background: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
          backdropFilter: 'blur(12px)',
          right: '1.25rem',
          bottom: isMobile ? 'calc(var(--bottom-nav-h) + 1rem)' : '1.25rem',
        }}
        aria-label={open ? 'Close voice assistant' : 'Open voice assistant'}
      >
        {/* Listening pulse rings */}
        {a11y.voiceListening && !open && (
          <>
            <span className="mic-ring" aria-hidden="true" />
            <span className="mic-ring" aria-hidden="true" />
            <span className="mic-ring" aria-hidden="true" />
          </>
        )}
        <span aria-hidden="true">
          {a11y.voiceError ? '⚠️' : a11y.voiceListening ? '🔴' : open ? '✕' : '🎤'}
        </span>
        <span>Voice</span>
        {/* Mic status dot */}
        {a11y.voiceNavEnabled && (
          <span
            className="ml-0.5 inline-block h-2 w-2 rounded-full"
            style={{ background: micStatus.color }}
            aria-label={`Microphone ${micStatus.label}`}
          />
        )}
      </button>
    </>
  )
}
