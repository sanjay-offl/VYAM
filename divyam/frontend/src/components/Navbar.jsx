import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function NavItem({ to, children, ariaLabel, onClick }) {
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-item transition-all duration-200 ${
          isActive
            ? 'bg-lavender-100/60 text-lavender-700 font-semibold'
            : 'text-gray-500 hover:text-lavender-700 hover:bg-lavender-50/50'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-2 py-1 focus:outline-none transition-opacity hover:opacity-85"
            aria-label="Go to DIVYAM Home"
          >
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              DIVYAM
            </span>
            <span className="hidden text-xs text-gray-400 font-normal md:inline">
              Accessible Learning
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav aria-label="Top navigation" className="hidden items-center gap-1 md:flex">
          <NavItem to="/" ariaLabel="Home">Home</NavItem>
          {isAuthenticated ? (
            <>
              <NavItem to="/dashboard" ariaLabel="Dashboard">Dashboard</NavItem>
              <NavItem to="/live" ariaLabel="Live classes">Live</NavItem>
              <NavItem to="/recorded" ariaLabel="Recorded lectures">Recorded</NavItem>
              {user?.role === 'TEACHER' ? (
                <NavItem to="/teacher" ariaLabel="Teacher panel">Teacher</NavItem>
              ) : null}
            </>
          ) : (
            <>
              <NavItem to="/login" ariaLabel="Login">Login</NavItem>
              <NavItem to="/register" ariaLabel="Register">Register</NavItem>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* User badge */}
              <div className="hidden items-center gap-2 md:flex">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)' }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-semibold text-gray-800 leading-tight">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">{user?.role || 'STUDENT'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                aria-label="Log out"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn btn-outline btn-sm" aria-label="Go to login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" aria-label="Go to register">Register</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border md:hidden transition-colors"
            style={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(237,233,254,0.5)' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span
                className="block h-0.5 w-5 rounded-full transition-all duration-200"
                style={{
                  background: '#8B5CF6',
                  transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all duration-200"
                style={{
                  background: '#8B5CF6',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all duration-200"
                style={{
                  background: '#8B5CF6',
                  transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
                }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          className="border-t px-4 py-4 md:hidden"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderColor: 'rgba(139,92,246,0.12)' }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            <NavItem to="/" ariaLabel="Home" onClick={() => setMobileOpen(false)}>🏠 Home</NavItem>
            {isAuthenticated ? (
              <>
                <NavItem to="/dashboard" ariaLabel="Dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</NavItem>
                <NavItem to="/live" ariaLabel="Live classes" onClick={() => setMobileOpen(false)}>🎥 Live</NavItem>
                <NavItem to="/recorded" ariaLabel="Recorded lectures" onClick={() => setMobileOpen(false)}>📚 Recorded</NavItem>
                {user?.role === 'TEACHER' ? (
                  <NavItem to="/teacher" ariaLabel="Teacher panel" onClick={() => setMobileOpen(false)}>👨‍🏫 Teacher</NavItem>
                ) : null}
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(139,92,246,0.12)' }}>
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)' }}
                    >
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user?.name || 'User'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm w-full mt-1"
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Link to="/login" className="btn btn-outline btn-sm w-full text-center" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm w-full text-center" onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
