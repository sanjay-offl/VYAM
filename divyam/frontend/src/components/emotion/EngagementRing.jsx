import React from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function EngagementRing({ score = 0 }) {
  const circumference = 2 * Math.PI * 38
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-purple-700">
          <Brain size={16} />
          Engagement Score
        </p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="38"
              stroke="url(#engagementGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.7 }}
            />
            <defs>
              <linearGradient id="engagementGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-purple-700">
            {Math.round(score)}%
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Engagement is based on</p>
          <p className="font-semibold text-gray-900">facial metrics & focus</p>
        </div>
      </div>
    </div>
  )
}
