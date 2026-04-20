import React, { useEffect, useMemo, useRef, useState } from 'react'
import useAccessibility from '../hooks/useAccessibility.js'

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function VideoPlayer({ src, title = 'Lecture', poster, transcript }) {
  const a11y = useAccessibility()
  const videoRef = useRef(null)
  const [speed, setSpeed] = useState(1)
  const [status, setStatus] = useState('Paused')

  const transcriptText = useMemo(() => {
    if (!transcript) return ''
    if (Array.isArray(transcript)) return transcript.join(' ')
    return String(transcript)
  }, [transcript])

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = speed
  }, [speed])

  useEffect(() => {
    if (!a11y.narrationEnabled) return
    if (!transcriptText) return

    // Keep it lightweight: narrate the title when playback starts.
    // Full transcript narration can be added later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a11y.narrationEnabled])

  function onPlay() {
    setStatus('Playing')
    if (a11y.narrationEnabled) a11y.speak(`Now playing ${title}`)
  }

  function onPause() {
    setStatus('Paused')
  }

  return (
    <section aria-label={`Video player: ${title}`} className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur">
        <video
          ref={videoRef}
          className="aspect-video w-full rounded-2xl bg-black"
          src={src}
          poster={poster}
          controls
          onPlay={onPlay}
          onPause={onPause}
          aria-label={title}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-text">Playback</div>
          <div className="mt-1 text-xs text-muted">Status: {status}</div>
          <label className="mt-3 block">
            <span className="text-sm text-text">Speed</span>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Playback speed"
            >
              {speeds.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="text-sm font-semibold text-text">Braille-ready notes</div>
          <p className="mt-1 text-xs text-muted">
            Structured content for screen readers and Braille displays.
          </p>
          <article className="prose prose-invert mt-3 max-w-none">
            <h3 className="text-sm font-semibold text-text">{title}</h3>
            <p className="text-sm text-muted">
              {transcriptText
                ? transcriptText
                : 'Transcript not available yet. Teacher can upload notes.'}
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
