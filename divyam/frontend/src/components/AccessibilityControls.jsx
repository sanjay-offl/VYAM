import React, { useState } from 'react'
import useAccessibility from '../hooks/useAccessibility.js'

export default function AccessibilityControls() {
  const a11y = useAccessibility()
  const [expanded, setExpanded] = useState(false)

  return (
    <section
      aria-label="Accessibility controls"
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-text">Accessibility</h2>
          <p className="text-sm text-muted">
            Text-to-Speech, contrast, font size, and voice navigation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
          aria-expanded={expanded}
          aria-controls="a11y-panel"
        >
          {expanded ? 'Hide' : 'Show'} controls
        </button>
      </div>

      {expanded ? (
        <div id="a11y-panel" className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
            <span className="text-sm text-text">High contrast</span>
            <input
              type="checkbox"
              checked={a11y.highContrast}
              onChange={(e) => a11y.setHighContrast(e.target.checked)}
              aria-label="Toggle high contrast mode"
              className="h-5 w-5 accent-[rgb(var(--color-gold))]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
            <span className="text-sm text-text">Text-to-Speech (TTS)</span>
            <input
              type="checkbox"
              checked={a11y.ttsEnabled}
              onChange={(e) => a11y.setTtsEnabled(e.target.checked)}
              aria-label="Toggle text to speech"
              className="h-5 w-5 accent-[rgb(var(--color-gold))]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
            <span className="text-sm text-text">Audio narration</span>
            <input
              type="checkbox"
              checked={a11y.narrationEnabled}
              onChange={(e) => a11y.setNarrationEnabled(e.target.checked)}
              aria-label="Toggle audio narration"
              className="h-5 w-5 accent-[rgb(var(--color-gold))]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
            <span className="text-sm text-text">Voice navigation</span>
            <input
              type="checkbox"
              checked={a11y.voiceNavEnabled}
              onChange={(e) => a11y.setVoiceNavEnabled(e.target.checked)}
              aria-label="Toggle voice navigation"
              className="h-5 w-5 accent-[rgb(var(--color-gold))]"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-text">Font size</span>
              <span className="text-xs text-muted">{Math.round(a11y.fontScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.4"
              step="0.05"
              value={a11y.fontScale}
              onChange={(e) => a11y.setFontScale(e.target.value)}
              aria-label="Font size"
              className="mt-2 w-full"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
            <div className="text-sm text-text">Quick TTS test</div>
            <p className="mt-1 text-xs text-muted">
              Uses your browser’s Speech Synthesis API.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => a11y.speak('Welcome to DIVYAM. Accessibility is enabled.')}
                className="rounded-xl border border-white/10 bg-gold/15 px-3 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
                aria-label="Play sample speech"
              >
                Speak
              </button>
              <button
                type="button"
                onClick={() => a11y.stopSpeaking()}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
                aria-label="Stop speech"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
