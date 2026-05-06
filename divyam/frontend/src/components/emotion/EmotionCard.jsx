import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { emotionEngine } from '../../utils/emotionEngine.js'

export default function EmotionCard({ emotionState }) {
  const { emotion, confidence } = emotionState
  const emotionInfo = emotionEngine.getEmotionInfo(emotion)

  return (
    <motion.div
      className="rounded-2xl border border-purple-200/30 bg-white/70 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-purple-700">Current Emotion</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">
            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
          </h3>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: `${emotionInfo.color}20` }}
        >
          <span className="text-2xl">{emotionInfo.emoji}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-purple-700">
            <Sparkles size={14} />
            Confidence
          </span>
          <span className="font-semibold text-gray-800">
            {Math.round(confidence * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-purple-100">
          <motion.div
            className="h-full rounded-full"
            style={{ background: emotionInfo.color }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-purple-50/60 px-3 py-2">
        <span className="flex items-center gap-2 text-xs font-medium text-purple-700">
          <Zap size={14} />
          AI Insight
        </span>
        <span className="text-xs text-gray-700">Real-time neural analysis</span>
      </div>
    </motion.div>
  )
}
