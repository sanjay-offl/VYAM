import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function EmotionTimeline({ history = [] }) {
  const chartData = history.map((entry, idx) => ({
    time: idx,
    confidence: Math.round(entry.confidence * 100),
  }))

  return (
    <motion.div
      className="rounded-3xl border border-purple-200/40 bg-white/70 p-5 backdrop-blur-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Emotion Timeline</h3>
        <span className="text-xs text-purple-600">Live confidence</span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 12,
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="h-2 w-2 rounded-full bg-purple-600" />
        <span>Confidence % over time</span>
      </div>
    </motion.div>
  )
}
