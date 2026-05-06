import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp } from 'lucide-react'

export default function TeacherAnalyticsView({ emotionState }) {
  const { metrics } = emotionState
  const focusPercent = Math.round(metrics.attentionLevel || 0)
  const fatigueAlert = metrics.attentionLevel < 35

  return (
    <motion.div
      className="rounded-3xl border border-purple-200/40 bg-white/70 p-5 backdrop-blur-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Teacher Analytics</h3>
        <span className="flex items-center gap-1 text-xs text-purple-700">
          <TrendingUp size={14} />
          Live
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500">Student Focus</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-purple-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${focusPercent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-600">{focusPercent}% focused</p>
        </div>

        <div className="rounded-2xl border border-purple-200/30 bg-purple-50/70 p-3">
          <p className="text-xs text-purple-700">Emotion Timeline</p>
          <div className="mt-2 flex items-center gap-2">
            {['Focused', 'Neutral', 'Happy', 'Confused', 'Tired'].map((e, idx) => (
              <span
                key={e}
                className="rounded-full border border-purple-200/40 bg-white px-2 py-1 text-[10px] text-gray-600"
                style={{ opacity: 1 - idx * 0.1 }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-3">
          <p className="text-xs text-gray-500">Fatigue Alerts</p>
          {fatigueAlert ? (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
              <AlertTriangle size={14} />
              Student appears fatigued
            </div>
          ) : (
            <p className="mt-2 text-xs text-green-600">No fatigue detected</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
