import React, { useEffect, useMemo, useState } from 'react'
import VideoPlayer from '../components/VideoPlayer.jsx'
import Loader from '../components/Loader.jsx'
import { listLecturesApi } from '../services/api.js'

export default function RecordedLectures() {
  const [lectures, setLectures] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)

  const fallback = useMemo(
    () => [
      {
        id: 'lec-1',
        title: 'Basics of Computers (Accessible Notes)',
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        transcript:
          'Today we learn screen reader friendly navigation, keyboard shortcuts, and safe browsing practices.',
      },
      {
        id: 'lec-2',
        title: 'Mathematics: Algebra Foundations',
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        transcript:
          'We cover variables, expressions, and step-by-step solving with clear structured notes.',
      },
    ],
    [],
  )

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      try {
        const data = await listLecturesApi().catch(() => ({ lectures: fallback }))
        if (!alive) return
        const list = data?.lectures?.length ? data.lectures : fallback
        setLectures(list)
        setSelectedId(list[0]?.id || '')
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [fallback])

  const selected = (lectures || []).find((l) => l.id === selectedId) || null

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-text">Recorded Lectures</h1>
        <p className="mt-1 text-sm text-muted">
          Video playback with speed control and optional narration.
        </p>
      </header>

      {loading ? <Loader label="Loading lectures…" /> : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Lecture list">
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-surface/20 p-4">
            <h2 className="text-sm font-semibold text-text">Lectures</h2>
            <ul className="mt-3 space-y-2">
              {(lectures || []).map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(l.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left focus:outline-none ${
                      l.id === selectedId
                        ? 'border-gold/40 bg-gold/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                    aria-label={`Select lecture ${l.title}`}
                  >
                    <div className="text-sm font-medium text-text">{l.title}</div>
                    <div className="mt-0.5 text-xs text-muted">ID: {l.id}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          {selected ? (
            <VideoPlayer
              src={selected.src}
              title={selected.title}
              transcript={selected.transcript}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted">
              Select a lecture to begin.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
