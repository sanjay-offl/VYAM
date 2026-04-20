import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { analyticsApi, listLecturesApi } from '../services/api.js'
import Loader from '../components/Loader.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [lectures, setLectures] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fallbackLectures = useMemo(
    () => [
      {
        id: 'lec-1',
        title: 'Basics of Computers (Accessible Notes)',
        description: 'Keyboard shortcuts, screen reader navigation, and safe browsing.',
      },
      {
        id: 'lec-2',
        title: 'Mathematics: Algebra Foundations',
        description: 'Structured step-by-step problem solving with narration support.',
      },
      {
        id: 'lec-3',
        title: 'English: Listening & Comprehension',
        description: 'Audio-first learning and pronunciation practice.',
      },
    ],
    [],
  )

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      try {
        const [lec, an] = await Promise.all([
          listLecturesApi().catch(() => ({ lectures: fallbackLectures })),
          analyticsApi().catch(() => ({
            summary: {
              completedLectures: 3,
              minutesWatched: 68,
              engagementScore: 0.76,
            },
          })),
        ])

        if (!alive) return
        setLectures(lec?.lectures || fallbackLectures)
        setAnalytics(an?.summary || an?.analytics || null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [fallbackLectures])

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome, <span className="text-text">{user?.name || 'Student'}</span>.
        </p>
      </header>

      {loading ? <Loader label="Loading dashboard…" /> : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Student progress">
        <div className="rounded-2xl border border-white/10 bg-surface/20 p-5">
          <div className="text-xs text-muted">Completed lectures</div>
          <div className="mt-1 text-2xl font-semibold text-text">
            {analytics?.completedLectures ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface/20 p-5">
          <div className="text-xs text-muted">Minutes watched</div>
          <div className="mt-1 text-2xl font-semibold text-text">
            {analytics?.minutesWatched ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface/20 p-5">
          <div className="text-xs text-muted">Engagement score</div>
          <div className="mt-1 text-2xl font-semibold text-text">
            {analytics?.engagementScore != null
              ? `${Math.round(analytics.engagementScore * 100)}%`
              : '—'}
          </div>
        </div>
      </section>

      <section aria-label="Recommended lectures" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-base font-semibold text-text">Recommended lectures</h2>
          <Link
            to="/recorded"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
            aria-label="View all recorded lectures"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {(lectures || []).slice(0, 4).map((l) => (
            <article
              key={l.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-sm font-semibold text-text">{l.title}</h3>
              <p className="mt-1 text-sm text-muted">{l.description}</p>
              <div className="mt-3">
                <Link
                  to="/recorded"
                  className="inline-flex rounded-xl border border-white/10 bg-gold/15 px-3 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
                  aria-label={`Open recorded lectures for ${l.title}`}
                >
                  Open
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Next actions" className="grid gap-3 md:grid-cols-2">
        <Link
          to="/live"
          className="rounded-2xl border border-white/10 bg-surface/20 p-5 hover:bg-surface/30 focus:outline-none"
          aria-label="Join live class"
        >
          <div className="text-sm font-semibold text-text">Join a live class</div>
          <div className="mt-1 text-sm text-muted">WebRTC preview + chat</div>
        </Link>
        <Link
          to="/recorded"
          className="rounded-2xl border border-white/10 bg-surface/20 p-5 hover:bg-surface/30 focus:outline-none"
          aria-label="Watch recorded lectures"
        >
          <div className="text-sm font-semibold text-text">Watch recorded lectures</div>
          <div className="mt-1 text-sm text-muted">Playback speed + narration</div>
        </Link>
      </section>
    </div>
  )
}
