import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { analyticsApi, listLecturesApi } from '../services/api.js'
import Loader from '../components/Loader.jsx'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [lectures, setLectures] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const [lec, an] = await Promise.all([
          listLecturesApi(),
          analyticsApi(),
        ])
        if (!alive) return
        setLectures(lec?.lectures || [])
        setAnalytics(an?.summary || an?.analytics || null)
      } catch {
        // Unexpected error (e.g. 401) — pages show empty gracefully
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])


  const stats = [
    { icon: '📖', value: analytics?.completedLectures ?? 0, label: 'Lectures Completed' },
    { icon: '⏱️', value: analytics?.minutesWatched ?? 0, label: 'Minutes Watched' },
    {
      icon: '🎯',
      value: analytics?.engagementScore != null
        ? `${Math.round(analytics.engagementScore * 100)}%`
        : '—',
      label: 'Engagement Score',
    },
  ]

  return (
    <div className="space-y-8 py-2">

      {/* ── Welcome Banner ───────────────────────────────────── */}
      <section
        className="rounded-2xl border px-7 py-6"
        style={{
          background: 'linear-gradient(135deg,rgba(237,233,254,0.65),rgba(245,243,255,0.55))',
          borderColor: 'rgba(196,181,253,0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h1
          className="text-3xl font-extrabold"
          style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#7C3AED,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome back,{' '}
          <span className="font-semibold" style={{ color: '#7C3AED' }}>{user?.name || 'Student'}</span>!
          {' '}Here's your progress overview.
        </p>
      </section>

      {loading ? <Loader label="Loading dashboard…" /> : null}

      {/* ── Stats Grid ───────────────────────────────────────── */}
      <motion.section
        className="grid gap-4 md:grid-cols-3"
        aria-label="Student progress"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            className="rounded-2xl border p-5 text-center transition-all duration-250 hover:-translate-y-1 hover:shadow-glass"
            style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
          >
            <div className="text-2xl mb-2" aria-hidden="true">{s.icon}</div>
            <div
              className="text-4xl font-extrabold leading-none"
              style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {s.value}
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Recommended Lectures ─────────────────────────────── */}
      <section aria-label="Recommended lectures" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins,sans-serif' }}>
            Recommended Lectures
          </h2>
          <Link
            to="/recorded"
            className="btn btn-outline btn-sm"
            aria-label="View all recorded lectures"
          >
            View All →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(lectures || []).slice(0, 4).map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.28 }}
              className="group rounded-2xl border p-5 transition-all duration-250 hover:-translate-y-1 hover:shadow-glass"
              style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
            >
              <h3 className="text-sm font-semibold text-gray-900 leading-snug">{l.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{l.description}</p>
              <div className="mt-4">
                <Link
                  to="/recorded"
                  className="btn btn-primary btn-sm"
                  aria-label={`Watch lecture: ${l.title}`}
                >
                  ▶ Watch Lecture
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <section aria-label="Quick actions" className="grid gap-4 md:grid-cols-2">
        <Link
          to="/live"
          className="group rounded-2xl border p-5 transition-all duration-250 hover:-translate-y-1 hover:shadow-glass hover:border-lavender-300/50"
          style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(10px)' }}
          aria-label="Join live class"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🎥</span>
            <div>
              <div className="text-sm font-semibold text-gray-900">Join a Live Class</div>
              <div className="mt-0.5 text-xs text-gray-500">WebRTC preview + real-time chat</div>
            </div>
          </div>
          <div className="mt-3 text-xs font-medium" style={{ color: '#8B5CF6' }}>Start session →</div>
        </Link>

        <Link
          to="/recorded"
          className="group rounded-2xl border p-5 transition-all duration-250 hover:-translate-y-1 hover:shadow-glass hover:border-lavender-300/50"
          style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(10px)' }}
          aria-label="Watch recorded lectures"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📚</span>
            <div>
              <div className="text-sm font-semibold text-gray-900">Watch Recorded Lectures</div>
              <div className="mt-0.5 text-xs text-gray-500">Playback speed + audio narration</div>
            </div>
          </div>
          <div className="mt-3 text-xs font-medium" style={{ color: '#8B5CF6' }}>Browse library →</div>
        </Link>
      </section>
    </div>
  )
}
