import React, { useEffect, useState } from 'react'
import VideoPlayer from '../components/VideoPlayer.jsx'
import Loader from '../components/Loader.jsx'
import { listLecturesApi } from '../services/api.js'

export default function RecordedLectures() {
  const [lectures, setLectures] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const data = await listLecturesApi()
        if (!alive) return
        const list = data?.lectures || []
        setLectures(list)
        setSelectedId(list[0]?.id || '')
      } catch {
        // Unexpected error — list stays empty
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const selected = (lectures || []).find((l) => l.id === selectedId) || null

  return (
    <div className="space-y-6 py-2">

      {/* Header */}
      <header
        className="rounded-2xl border px-6 py-5"
        style={{ background: 'linear-gradient(135deg,rgba(237,233,254,0.65),rgba(245,243,255,0.55))', borderColor: 'rgba(196,181,253,0.35)' }}
      >
        <h1
          className="text-2xl font-extrabold"
          style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#7C3AED,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          📚 Recorded Lectures
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Video playback with speed control and optional audio narration.
        </p>
      </header>

      {loading ? <Loader label="Loading lectures…" /> : null}

      <section className="grid gap-5 md:grid-cols-3" aria-label="Lecture list">

        {/* Left: Lecture List */}
        <div className="md:col-span-1">
          <div
            className="rounded-2xl border p-4"
            style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
          >
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">Lectures</h2>
            <ul className="space-y-2" role="listbox" aria-label="Available lectures">
              {(lectures || []).map((l) => (
                <li key={l.id} role="option" aria-selected={l.id === selectedId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(l.id)}
                    className="w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none hover:scale-[1.01]"
                    style={
                      l.id === selectedId
                        ? { background: 'rgba(196,181,253,0.25)', borderColor: 'rgba(139,92,246,0.45)', boxShadow: '0 0 0 2px rgba(139,92,246,0.1)' }
                        : { background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(139,92,246,0.1)' }
                    }
                    aria-label={`Select lecture: ${l.title}`}
                  >
                    <div
                      className="text-sm font-semibold leading-snug"
                      style={{ color: l.id === selectedId ? '#6D28D9' : '#374151' }}
                    >
                      {l.title}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">ID: {l.id}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Player */}
        <div className="md:col-span-2">
          {selected ? (
            <VideoPlayer
              src={selected.src}
              title={selected.title}
              transcript={selected.transcript}
            />
          ) : (
            <div
              className="flex h-40 items-center justify-center rounded-2xl border text-sm text-gray-400"
              style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(139,92,246,0.15)' }}
            >
              Select a lecture from the list to begin.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
