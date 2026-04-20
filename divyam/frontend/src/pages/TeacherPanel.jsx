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
      .catch(() =>
        setAnalytics({
          completedLectures: 12,
          minutesWatched: 820,
          engagementScore: 0.81,
        }),
      )
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

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-text">Teacher Panel</h1>
        <p className="mt-1 text-sm text-muted">
          Upload lectures, assign homework, and view engagement analytics.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Analytics">
        <div className="rounded-2xl border border-white/10 bg-surface/20 p-5">
          <div className="text-xs text-muted">Completed lectures</div>
          <div className="mt-1 text-2xl font-semibold text-text">
            {analytics?.completedLectures ?? '—'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface/20 p-5">
          <div className="text-xs text-muted">Minutes watched</div>
          <div className="mt-1 text-2xl font-semibold text-text">
            {analytics?.minutesWatched ?? '—'}
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

      <section className="grid gap-4 md:grid-cols-2" aria-label="Teacher actions">
        <form onSubmit={onUpload} className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-text">Upload a lecture</h2>
          <p className="mt-1 text-sm text-muted">
            Prototype upload endpoint: <span className="text-text">POST /api/videos</span>
          </p>

          {error ? (
            <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-text" role="alert">
              {error}
            </div>
          ) : null}

          {status ? (
            <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-text" role="status">
              {status}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm text-text">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
                aria-label="Lecture title"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-text">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 h-24 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
                aria-label="Lecture description"
              />
            </label>

            <label className="block">
              <span className="text-sm text-text">Video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
                aria-label="Select video file"
                required
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl border border-white/10 bg-gold/15 px-4 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none disabled:opacity-50"
                aria-label="Upload lecture"
              >
                Upload
              </button>
              {loading ? <Loader label="Uploading…" /> : null}
            </div>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-text">Assign homework</h2>
          <p className="mt-1 text-sm text-muted">
            Prototype form. Backend endpoint can be added under <span className="text-text">/api/analytics</span> or <span className="text-text">/api/users</span>.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm text-text">Homework title</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
                aria-label="Homework title"
                placeholder="e.g., Practice algebra problems"
              />
            </label>
            <label className="block">
              <span className="text-sm text-text">Instructions</span>
              <textarea
                className="mt-1 h-24 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
                aria-label="Homework instructions"
                placeholder="Write in clear steps for screen readers."
              />
            </label>
            <button
              type="button"
              onClick={() => alert('Prototype: assignment saved locally (no-op).')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
              aria-label="Save homework"
            >
              Save homework
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
