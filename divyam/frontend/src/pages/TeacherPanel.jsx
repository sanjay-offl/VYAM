import React, { useEffect, useState } from 'react'
import { analyticsApi, uploadLectureApi } from '../services/api.js'
import Loader from '../components/Loader.jsx'

export default function TeacherPanel() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    analyticsApi()
      .then((d) => setAnalytics(d?.summary || d?.analytics || null))
      .catch(() => {}) // Unexpected errors — analytics stays null, zeros shown
  }, [])


  async function onUpload(e) {
    e.preventDefault()
    setError('')
    setStatus('')
    if (!title || !file) {
      setError('Please provide a title and select a file.')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('file', file)
      await uploadLectureApi(formData)
      setStatus('Uploaded successfully.')
      setTitle('')
      setDescription('')
      setFile(null)
    } catch {
      setStatus('Backend not running — upload saved as prototype (no-op).')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { icon: '📖', value: analytics?.completedLectures ?? '—', label: 'Lectures Uploaded' },
    { icon: '⏱️', value: analytics?.minutesWatched ?? '—', label: 'Minutes Watched' },
    {
      icon: '🎯',
      value: analytics?.engagementScore != null
        ? `${Math.round(analytics.engagementScore * 100)}%`
        : '—',
      label: 'Engagement Score',
    },
  ]

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
          👨‍🏫 Teacher Panel
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload lectures, assign homework, and view student engagement analytics.
        </p>
      </header>

      {/* Analytics Stats */}
      <section className="grid gap-4 md:grid-cols-3" aria-label="Class analytics">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border p-5 text-center transition-all duration-250 hover:-translate-y-1 hover:shadow-glass"
            style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
          >
            <div className="text-2xl mb-2" aria-hidden="true">{s.icon}</div>
            <div
              className="text-3xl font-extrabold"
              style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {s.value}
            </div>
            <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Action Forms */}
      <section className="grid gap-5 md:grid-cols-2" aria-label="Teacher actions">

        {/* Upload Form */}
        <form
          onSubmit={onUpload}
          className="rounded-2xl border p-6"
          style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Poppins,sans-serif' }}>
            📤 Upload a Lecture
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Endpoint: <code className="rounded px-1" style={{ background: 'rgba(196,181,253,0.2)', color: '#7C3AED', fontSize: '0.7rem' }}>POST /api/videos</code>
          </p>

          {/* Error / Status */}
          {error ? (
            <div
              className="mt-4 rounded-xl border px-3 py-2 text-sm text-red-700"
              style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}
              role="alert"
            >
              ⚠️ {error}
            </div>
          ) : null}
          {status ? (
            <div
              className="mt-4 rounded-xl border px-3 py-2 text-sm"
              style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.3)', color: '#15803D' }}
              role="status"
            >
              ✅ {status}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            <div className="form-group">
              <label htmlFor="lec-title">Title</label>
              <input
                id="lec-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Lecture title"
                placeholder="e.g., Introduction to Algebra"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lec-desc">Description</label>
              <textarea
                id="lec-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24"
                aria-label="Lecture description"
                placeholder="Brief overview of the lecture…"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lec-file">Video File</label>
              <input
                id="lec-file"
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                aria-label="Select video file"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                aria-label="Upload lecture"
              >
                {loading ? 'Uploading…' : '📤 Upload'}
              </button>
              {loading ? <Loader label="Uploading…" /> : null}
            </div>
          </div>
        </form>

        {/* Homework Form */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Poppins,sans-serif' }}>
            📝 Assign Homework
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Prototype form — backend can be added under{' '}
            <code className="rounded px-1" style={{ background: 'rgba(196,181,253,0.2)', color: '#7C3AED', fontSize: '0.7rem' }}>/api/analytics</code>
          </p>

          <div className="mt-5 space-y-4">
            <div className="form-group">
              <label htmlFor="hw-title">Homework Title</label>
              <input
                id="hw-title"
                aria-label="Homework title"
                placeholder="e.g., Practice algebra problems"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hw-instructions">Instructions</label>
              <textarea
                id="hw-instructions"
                className="h-24"
                aria-label="Homework instructions"
                placeholder="Write in clear steps for screen readers."
              />
            </div>
            <button
              type="button"
              onClick={() => alert('Prototype: assignment saved locally (no-op).')}
              className="btn btn-secondary"
              aria-label="Save homework"
            >
              💾 Save Homework
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
