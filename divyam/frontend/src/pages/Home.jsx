import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

export default function Home() {
  return (
    <div className="space-y-10 py-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-2xl font-semibold text-text md:text-3xl"
        >
          DIVYAM
        </motion.h1>
        <p className="mt-2 text-sm text-muted md:text-base">
          Digital Innovation for Visionary Young Accessible Minds — an accessible
          education platform for visually impaired students in India.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/10 bg-gold/15 px-4 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
            aria-label="Sign in or register"
          >
            Sign in / Register
          </Link>
          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
            aria-label="Go to dashboard"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Features">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-base font-semibold text-text">Accessible by design</h2>
          <p className="mt-2 text-sm text-muted">
            Keyboard navigation, ARIA labels, semantic layout, high contrast, and
            text-to-speech.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-base font-semibold text-text">Live + recorded learning</h2>
          <p className="mt-2 text-sm text-muted">
            WebRTC-based live classes (prototype) and recorded lecture playback
            with speed control.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-base font-semibold text-text">AI-ready structure</h2>
          <p className="mt-2 text-sm text-muted">
            Emotion detection and engagement tracking endpoints are wired as
            placeholders, ready for later integration.
          </p>
        </div>
      </section>

      <section
        className="rounded-2xl border border-white/10 bg-surface/20 p-5 backdrop-blur"
        aria-label="How to use"
      >
        <h2 className="text-base font-semibold text-text">Quick start (demo)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>
            Student demo: <span className="text-text">student@divyam.local</span> /
            <span className="text-text"> student123</span>
          </li>
          <li>
            Teacher demo: <span className="text-text">teacher@divyam.local</span> /
            <span className="text-text"> teacher123</span>
          </li>
          <li>Enable Voice Navigation in Accessibility panel and say “dashboard”.</li>
        </ul>
      </section>
    </div>
  )
}
