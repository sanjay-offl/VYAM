import { useEffect, useRef, Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import BottomNav from './components/BottomNav.jsx'
import AccessibilityControls from './components/AccessibilityControls.jsx'
import VoiceAssistant from './components/VoiceAssistant.jsx'
import Skeleton from './components/Skeleton.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { voiceCommandToPath, getRouteLabel } from './hooks/useAccessibility.js'
import useSpeech from './hooks/useSpeech.js'

// Lazy loaded pages for code splitting
const Home = lazy(() => import('./pages/Home.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const LiveClass = lazy(() => import('./pages/LiveClass.jsx'))
const RecordedLectures = lazy(() => import('./pages/RecordedLectures.jsx'))
const TeacherPanel = lazy(() => import('./pages/TeacherPanel.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="min-h-[calc(100vh-4rem)]"
    >
      {children}
    </motion.div>
  )
}

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

/** Bridges voice events → React Router navigation with debounce + TTS feedback */
function VoiceNavBridge() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { speak } = useSpeech({ enabled: true })
  const cooldownRef = useRef(false) // prevents duplicate triggers

  useEffect(() => {
    const onVoice = (e) => {
      const transcript = String(e?.detail || '').trim()
      if (!transcript) return

      // Prevent duplicate navigation within 1.5s cooldown
      if (cooldownRef.current) {
        console.log(`[DIVYAM Nav] ⏳ Cooldown active, ignoring: "${transcript}"`)
        return
      }

      const path = voiceCommandToPath(transcript)

      if (!path) {
        console.log(`[DIVYAM Nav] ❓ No route matched for: "${transcript}"`)
        return
      }

      // Activate cooldown
      cooldownRef.current = true
      setTimeout(() => { cooldownRef.current = false }, 1500)

      // Handle logout separately
      if (path === '__logout__') {
        console.log(`[DIVYAM Nav] 🚪 Logging out via voice`)
        speak('Logging out. Goodbye!')
        logout()
        navigate('/')
        return
      }

      const label = getRouteLabel(path) || path
      console.log(`[DIVYAM Nav] 🧭 Navigating to ${path} (${label}) from: "${transcript}"`)
      speak(`Opening ${label}`)
      navigate(path)
    }

    window.addEventListener('divyam:voice', onVoice)
    return () => window.removeEventListener('divyam:voice', onVoice)
  }, [logout, navigate, speak])

  return null
}

export default function App() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--color-bg))' }}>
      <VoiceNavBridge />
      <VoiceAssistant />
      <a className="skip-link" href="#main">Skip to main content</a>

      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-12 pt-6 md:px-6">
        {isAuthenticated ? (
          <aside className="hidden w-64 shrink-0 md:block" aria-label="Sidebar">
            <Sidebar />
          </aside>
        ) : null}

        <main
          id="main"
          role="main"
          className={`w-full min-w-0 rounded-2xl border bg-white/60 p-5 shadow-glass backdrop-blur-xl md:p-7 ${isAuthenticated ? 'pb-24 md:pb-7' : ''}`}
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <div className="mb-5">
            <AccessibilityControls />
          </div>

          <AnimatePresence mode="wait">
            <Suspense fallback={
              <div className="p-8">
                <Skeleton variant="card" count={3} />
              </div>
            }>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Page><Home /></Page>} />
                <Route path="/login" element={<Page><Login /></Page>} />
                <Route path="/register" element={<Page><Register /></Page>} />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute><Page><Dashboard /></Page></ProtectedRoute>}
                />
                <Route
                  path="/live"
                  element={<ProtectedRoute><Page><LiveClass /></Page></ProtectedRoute>}
                />
                <Route
                  path="/recorded"
                  element={<ProtectedRoute><Page><RecordedLectures /></Page></ProtectedRoute>}
                />
                <Route
                  path="/teacher"
                  element={<ProtectedRoute role="TEACHER"><Page><TeacherPanel /></Page></ProtectedRoute>}
                />
                <Route path="*" element={<Page><NotFound /></Page>} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom navigation for authenticated users */}
      {isAuthenticated && <BottomNav />}
    </div>
  )
}
