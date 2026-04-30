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
    <div className="space-y-8 py-4">
      <section className="card card-glow">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, <span className="font-semibold text-purple-900">{user?.name || 'Student'}</span>! Here's your progress overview.
        </p>
      </section>

      {loading ? <Loader label="Loading dashboard…" /> : null}

      <section className="grid-3" aria-label="Student progress">
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Completed Lectures</div>
          <div className="mt-3 text-4xl font-bold text-purple-600">
            {analytics?.completedLectures ?? 0}
          </div>
          <div className="mt-2 text-sm text-gray-600">lectures completed this term</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Minutes Watched</div>
          <div className="mt-3 text-4xl font-bold text-purple-600">
            {analytics?.minutesWatched ?? 0}
          </div>
          <div className="mt-2 text-sm text-gray-600">total learning time</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Engagement Score</div>
          <div className="mt-3 text-4xl font-bold text-purple-600">
            {analytics?.engagementScore != null ? `${Math.round(analytics.engagementScore * 100)}%` : '—'}
          </div>
          <div className="mt-2 text-sm text-gray-600">based on participation</div>
        </div>
      </section>

      <section aria-label="Recommended lectures" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">Recommended Lectures</h2>
          <Link
            to="/recorded"
            className="btn btn-outline btn-sm"
            aria-label="View all recorded lectures"
          >
            View All Lectures →
          </Link>
        </div>

        <div className="grid-2">
          {(lectures || []).slice(0, 4).map((l) => (
            <article key={l.id} className="card group">
              <h3 className="text-base font-semibold text-gray-900">{l.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{l.description}</p>
              <div className="mt-4">
                <Link
                  to="/recorded"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-500/25"
                  aria-label={`Open recorded lectures for ${l.title}`}
                >
                  Watch Lecture →
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
