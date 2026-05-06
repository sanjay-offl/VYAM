import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

function buildMockHistory() {
  const emotions = ['Focused', 'Neutral', 'Happy', 'Confused', 'Tired']
  return Array.from({ length: 30 }).map((_, idx) => {
    const focus = Math.max(20, Math.min(95, 55 + Math.sin(idx / 3) * 20 + Math.random() * 15))
    const fatigue = Math.max(0, Math.min(100, 100 - focus + Math.random() * 10))
    return {
      time: `${idx + 1}m`,
      focus: Math.round(focus),
      fatigue: Math.round(fatigue),
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
    }
  })
}

export default function TeacherView() {
  const history = useMemo(() => buildMockHistory(), [])
  const averageFocus = Math.round(history.reduce((sum, h) => sum + h.focus, 0) / history.length)
  const fatigueAlerts = history.filter((h) => h.fatigue > 65).length

  const handleExport = () => {
    const header = ['time', 'focus', 'fatigue', 'emotion']
    const rows = history.map((h) => [h.time, h.focus, h.fatigue, h.emotion])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'divyam-teacher-analytics.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 py-2">
      <header
        className="rounded-3xl border px-6 py-5"
        style={{ background: 'linear-gradient(135deg,rgba(237,233,254,0.65),rgba(224,231,255,0.45))', borderColor: 'rgba(196,181,253,0.35)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-extrabold"
              style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Teacher View
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Historical engagement analytics and emotion trends.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-2xl border border-purple-200/60 bg-white/80 px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:-translate-y-0.5"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Teacher analytics stats">
        <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-700">Average Focus</p>
            <TrendingUp size={16} className="text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{averageFocus}%</p>
          <p className="mt-1 text-xs text-gray-500">Last 30 minutes</p>
        </div>
        <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-700">Fatigue Alerts</p>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{fatigueAlerts}</p>
          <p className="mt-1 text-xs text-gray-500">High fatigue moments</p>
        </div>
        <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-700">Emotion Mix</p>
            <BarChart3 size={16} className="text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">Balanced</p>
          <p className="mt-1 text-xs text-gray-500">Mood distribution</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <motion.section
          className="rounded-3xl border border-purple-200/40 bg-white/70 p-5 backdrop-blur-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Student Attention Graph</h2>
            <span className="text-xs text-purple-600">Focus vs Fatigue</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.15)" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 12,
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}
                />
                <Area type="monotone" dataKey="focus" stroke="#8B5CF6" fill="url(#focusGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          className="rounded-3xl border border-purple-200/40 bg-white/70 p-5 backdrop-blur-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Emotion Timeline</h2>
            <span className="text-xs text-purple-600">Confidence trend</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 12,
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}
                />
                <Line type="monotone" dataKey="fatigue" stroke="#F59E0B" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
