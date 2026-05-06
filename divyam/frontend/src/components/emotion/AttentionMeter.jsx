import React from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function AttentionMeter({ level = 0 }) {
  const status = level > 75 ? 'High' : level > 45 ? 'Medium' : 'Low'
  const color = level > 75 ? 'from-emerald-500' : level > 45 ? 'from-yellow-500' : 'from-red-500'

  return (
    <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-purple-700">
          <Activity size={16} />
          Attention Meter
        </p>
        <span className="text-sm font-semibold text-gray-800">{status}</span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-purple-100">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${color} to-purple-600`}
            initial={{ width: 0 }}
            animate={{ width: `${level}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-600">{Math.round(level)}% attention detected</p>
      </div>
    </div>
  )
}
