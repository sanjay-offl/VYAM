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

  const [error, setError] = useState('')
  const [isBuffering, setIsBuffering] = useState(false)

  // Robustly apply playback rate even when video is loading
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }, [speed])

  function handleLoadedMetadata() {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  function handlePlay() {
    setStatus('Playing')
    setError('')
    if (a11y.narrationEnabled) a11y.speak(`Now playing ${title}`)
  }

  function handlePause() {
    setStatus('Paused')
  }

  function handleWaiting() {
    setIsBuffering(true)
  }

  function handlePlaying() {
    setIsBuffering(false)
  }

  function handleError(e) {
    const videoError = e.target.error
    let errorMessage = 'An unknown video error occurred.'
    if (videoError) {
      switch (videoError.code) {
        case 1: errorMessage = 'Video loading aborted.'; break
        case 2: errorMessage = 'A network error caused the video download to fail.'; break
        case 3: errorMessage = 'The video playback was aborted due to a corruption problem.'; break
        case 4: errorMessage = 'The video could not be loaded (format not supported).'; break
        default: errorMessage = 'An unexpected video error occurred.'
      }
    }
    setError(errorMessage)
    setStatus('Error')
    setIsBuffering(false)
  }

  return (
    <section aria-label={`Video player: ${title}`} className="space-y-4">
      {/* Video container */}
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{ background: '#0a0a0f', borderColor: 'rgba(139,92,246,0.2)' }}
      >
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-sm text-red-500">
            ⚠️ {error}
          </div>
        )}
        {isBuffering && !error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-lavender-500 border-t-transparent"></div>
          </div>
        )}
        <video
          ref={videoRef}
          className="aspect-video w-full rounded-2xl bg-black"
          src={src}
          poster={poster}
          controls
          playsInline // Essential for iOS/Safari
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onError={handleError}
          aria-label={title}
        />
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Playback speed */}
        <div
          className="rounded-2xl border p-4"
          style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Playback</div>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ background: status === 'Playing' ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.12)', color: status === 'Playing' ? '#15803D' : '#7C3AED' }}
            >
              {status}
            </span>
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-medium text-gray-600">Speed</span>
            <select
              className="mt-1 w-full"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Playback speed"
              style={{ borderRadius: '10px', borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
            >
              {speeds.map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>
          </label>
        </div>

        {/* Transcript / Braille notes */}
        <div
          className="rounded-2xl border p-4 md:col-span-2"
          style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <div className="text-sm font-semibold text-gray-800">📖 Braille-ready notes</div>
          <p className="mt-0.5 text-xs text-gray-500">
            Structured content for screen readers and Braille displays.
          </p>
          <article className="mt-3">
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
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
