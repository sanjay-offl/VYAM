import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DivyamLogo from '../components/DivyamLogo.jsx'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.32, ease: 'easeOut' },
  },
}

const features = [
  {
    icon: '♿',
    title: 'Accessible by Design',
    desc: 'Keyboard navigation, ARIA labels, semantic layout, high contrast, and text-to-speech — built for every learner.',
  },
  {
    icon: '🎥',
    title: 'Live + Recorded Learning',
    desc: 'WebRTC-based live classes and on-demand lecture playback with speed control and narration support.',
  },
  {
    icon: '🤖',
    title: 'AI-Ready Structure',
    desc: 'Emotion detection and engagement tracking endpoints are wired and ready for production integration.',
  },
]

export default function Home() {
  return (
    <div className="space-y-10 py-2">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border px-6 py-12 md:px-10 md:py-16"
        style={{
          background: 'linear-gradient(135deg, rgba(237,233,254,0.7) 0%, rgba(245,243,255,0.6) 50%, rgba(224,231,255,0.4) 100%)',
          borderColor: 'rgba(196,181,253,0.35)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Decorative orbs */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #818CF8, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Logo + Badge */}
        <motion.div variants={itemVariants} className="relative flex flex-wrap items-center gap-4 mb-6">
          <DivyamLogo size={56} className="drop-shadow-sm" />
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(196,181,253,0.3)', color: '#7C3AED', border: '1px solid rgba(196,181,253,0.5)' }}
          >
            🇮🇳 AI Learning Platform India
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="relative mt-2 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <span style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            DIVYAM
          </span>
          <br />
          <span className="text-gray-800 text-3xl md:text-4xl">Accessible Education,</span>
          <br />
          <span className="text-gray-600 text-2xl md:text-3xl font-semibold">Reimagined for India.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="relative mt-5 max-w-xl text-base text-gray-600 leading-relaxed md:text-lg"
        >
          Digital Innovation for Visionary Young Accessible Minds — a premium accessible
          education platform for visually impaired students across{' '}
          <span className="font-semibold text-lavender-700">Tamil Nadu</span> and India.
        </motion.p>

        <motion.div variants={itemVariants} className="relative mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="btn btn-primary btn-lg"
            aria-label="Sign in or register for DIVYAM"
          >
            🚀 Get Started
          </Link>
          <Link
            to="/dashboard"
            className="btn btn-outline btn-lg"
            aria-label="Go to dashboard"
          >
            Open Dashboard →
          </Link>
        </motion.div>

        {/* Stats ribbon */}
        <motion.div
          variants={itemVariants}
          className="relative mt-10 grid grid-cols-3 gap-4 max-w-md"
        >
          {[
            { value: '10K+', label: 'Students' },
            { value: '500+', label: 'Lectures' },
            { value: '98%', label: 'Satisfaction' },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center rounded-xl p-3 border"
              style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(196,181,253,0.25)' }}
            >
              <div
                className="text-2xl font-extrabold"
                style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {s.value}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.header>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section aria-label="Platform features">
        <h2
          className="mb-6 text-center text-2xl font-bold"
          style={{ fontFamily: 'Poppins, sans-serif', color: '#111827' }}
        >
          Why DIVYAM?
        </h2>
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className="card group cursor-default"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: 'linear-gradient(135deg,rgba(196,181,253,0.3),rgba(99,102,241,0.15))' }}
              >
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Quick Start ───────────────────────────────────────── */}
      <section
        className="rounded-2xl border p-6"
        style={{ background: 'rgba(237,233,254,0.45)', borderColor: 'rgba(196,181,253,0.35)', backdropFilter: 'blur(10px)' }}
        aria-label="Quick start guide"
      >
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          ⚡ Quick Start (Demo)
        </h2>
        <p className="text-sm text-gray-500 mb-4">Try these credentials to explore the platform instantly.</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-lavender-600 font-medium shrink-0">Student:</span>
            <span className="text-gray-700">student@divyam.local / <code className="rounded px-1 py-0.5 text-xs" style={{ background: 'rgba(196,181,253,0.25)' }}>student123</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender-600 font-medium shrink-0">Teacher:</span>
            <span className="text-gray-700">teacher@divyam.local / <code className="rounded px-1 py-0.5 text-xs" style={{ background: 'rgba(196,181,253,0.25)' }}>teacher123</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender-600 font-medium shrink-0">Voice:</span>
            <span className="text-gray-700">Enable Voice Navigation in Accessibility panel and say "dashboard".</span>
          </li>
        </ul>
      </section>

    </div>
  )
}
