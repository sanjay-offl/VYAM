import React, { useState } from 'react'
import useAccessibility from '../hooks/useAccessibility.js'

export default function AccessibilityControls() {
  const a11y = useAccessibility()
  const [expanded, setExpanded] = useState(false)

  return (
    <section
      aria-label="Accessibility controls"
      className="rounded-2xl border p-4"
      style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            ♿ Accessibility
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            TTS, contrast, font size & voice navigation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="btn btn-outline btn-sm"
          aria-expanded={expanded}
          aria-controls="a11y-panel"
        >
          {expanded ? '▲ Hide' : '▼ Show'} controls
        </button>
      </div>

      {expanded ? (
        <div id="a11y-panel" className="mt-4 grid gap-3 md:grid-cols-2">

          {/* High Contrast */}
          <label
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-lavender-50/50"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(255,255,255,0.6)' }}
          >
            <span className="text-sm text-gray-800 font-medium">High contrast</span>
            <input
              type="checkbox"
              checked={a11y.highContrast}
              onChange={(e) => a11y.setHighContrast(e.target.checked)}
              aria-label="Toggle high contrast mode"
              className="h-5 w-5 rounded accent-violet-600"
            />
          </label>

          {/* TTS */}
          <label
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-lavender-50/50"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(255,255,255,0.6)' }}
          >
            <span className="text-sm text-gray-800 font-medium">Text-to-Speech</span>
            <input
              type="checkbox"
              checked={a11y.ttsEnabled}
              onChange={(e) => a11y.setTtsEnabled(e.target.checked)}
              aria-label="Toggle text to speech"
              className="h-5 w-5 rounded accent-violet-600"
            />
          </label>

          {/* Audio Narration */}
          <label
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-lavender-50/50"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(255,255,255,0.6)' }}
          >
            <span className="text-sm text-gray-800 font-medium">Audio narration</span>
            <input
              type="checkbox"
              checked={a11y.narrationEnabled}
              onChange={(e) => a11y.setNarrationEnabled(e.target.checked)}
              aria-label="Toggle audio narration"
              className="h-5 w-5 rounded accent-violet-600"
            />
          </label>

          {/* Voice Nav */}
          <label
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-lavender-50/50"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(255,255,255,0.6)' }}
          >
            <span className="text-sm text-gray-800 font-medium">Voice navigation</span>
            <input
              type="checkbox"
              checked={a11y.voiceNavEnabled}
              onChange={(e) => a11y.setVoiceNavEnabled(e.target.checked)}
              aria-label="Toggle voice navigation"
              className="h-5 w-5 rounded accent-violet-600"
            />
          </label>

          {/* Font Size */}
          <div
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(255,255,255,0.6)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-800 font-medium">Font size</span>
              <span
                className="text-xs font-semibold rounded-full px-2 py-0.5"
                style={{ background: 'rgba(196,181,253,0.3)', color: '#7C3AED' }}
              >
                {Math.round(a11y.fontScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.4"
              step="0.05"
              value={a11y.fontScale}
              onChange={(e) => a11y.setFontScale(e.target.value)}
              aria-label="Font size"
              className="mt-2 w-full accent-violet-600"
            />
          </div>

          {/* TTS Test */}
          <div
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(255,255,255,0.6)' }}
          >
            <div className="text-sm text-gray-800 font-medium">Quick TTS test</div>
            <p className="mt-0.5 text-xs text-gray-500">Uses browser Speech Synthesis API.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => a11y.speak('Welcome to DIVYAM. Accessibility is enabled.')}
                className="btn btn-primary btn-sm"
                aria-label="Play sample speech"
              >
                🔊 Speak
              </button>
              <button
                type="button"
                onClick={() => a11y.stopSpeaking()}
                className="btn btn-outline btn-sm"
                aria-label="Stop speech"
              >
                ⏹ Stop
              </button>
            </div>
          </div>

        </div>
      ) : null}
    </section>
  )
}
