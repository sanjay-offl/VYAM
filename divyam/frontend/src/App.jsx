import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import AccessibilityControls from './components/AccessibilityControls.jsx'
import VoiceAssistant from './components/VoiceAssistant.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LiveClass from './pages/LiveClass.jsx'
import RecordedLectures from './pages/RecordedLectures.jsx'
import TeacherPanel from './pages/TeacherPanel.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { voiceCommandToPath } from './hooks/useAccessibility.js'

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
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

function VoiceNavBridge() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const onVoice = (e) => {
      const transcript = e?.detail
      const lower = String(transcript || '').toLowerCase()
      if (lower.includes('logout') || lower.includes('log out')) {
        logout()
        navigate('/')
        return
      }

      const path = voiceCommandToPath(transcript)
      if (path) navigate(path)
    }

    window.addEventListener('divyam:voice', onVoice)
    return () => window.removeEventListener('divyam:voice', onVoice)
  }, [logout, navigate])

  return null
}

export default function App() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen text-text">
      <VoiceNavBridge />
      <VoiceAssistant />
      <a className="skip-link rounded-xl bg-surface/80 px-4 py-2 text-text backdrop-blur" href="#main">
        Skip to main content
      </a>

      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl gap-4 px-3 pb-10 pt-4 md:px-6">
        {isAuthenticated ? (
          <aside className="hidden w-64 shrink-0 md:block">
            <Sidebar />
          </aside>
        ) : null}

        <main
          id="main"
          role="main"
          className="w-full rounded-2xl border border-white/10 bg-surface/25 p-4 shadow-2xl backdrop-blur-md md:p-6"
        >
          <div className="mb-4">
            <AccessibilityControls />
          </div>

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <Page>
                    <Home />
                  </Page>
                }
              />
              <Route
                path="/login"
                element={
                  <Page>
                    <Login />
                  </Page>
                }
              />
              <Route
                path="/register"
                element={
                  <Page>
                    <Register />
                  </Page>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Page>
                      <Dashboard />
                    </Page>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live"
                element={
                  <ProtectedRoute>
                    <Page>
                      <LiveClass />
                    </Page>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recorded"
                element={
                  <ProtectedRoute>
                    <Page>
                      <RecordedLectures />
                    </Page>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute role="TEACHER">
                    <Page>
                      <TeacherPanel />
                    </Page>
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <Page>
                    <NotFound />
                  </Page>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
