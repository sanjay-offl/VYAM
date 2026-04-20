import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function NavItem({ to, children, ariaLabel }) {
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm transition focus:outline-none ${
          isActive
            ? 'bg-gold/15 text-text'
            : 'text-muted hover:bg-white/5 hover:text-text'
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

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface/20 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-xl px-2 py-1 text-base font-semibold tracking-wide text-text focus:outline-none"
            aria-label="Go to DIVYAM Home"
          >
            <span className="text-gold">DIVYAM</span>
            <span className="ml-2 hidden text-muted md:inline">
              Digital Innovation for Visionary Young Accessible Minds
            </span>
          </Link>
        </div>

        <nav aria-label="Top navigation" className="hidden items-center gap-1 md:flex">
          <NavItem to="/" ariaLabel="Home">
            Home
          </NavItem>
          {isAuthenticated ? (
            <>
              <NavItem to="/dashboard" ariaLabel="Dashboard">
                Dashboard
              </NavItem>
              <NavItem to="/live" ariaLabel="Live classes">
                Live
              </NavItem>
              <NavItem to="/recorded" ariaLabel="Recorded lectures">
                Recorded
              </NavItem>
              {user?.role === 'TEACHER' ? (
                <NavItem to="/teacher" ariaLabel="Teacher panel">
                  Teacher
                </NavItem>
              ) : null}
            </>
          ) : (
            <>
              <NavItem to="/login" ariaLabel="Login">
                Login
              </NavItem>
              <NavItem to="/register" ariaLabel="Register">
                Register
              </NavItem>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden text-right md:block">
                <div className="text-sm text-text">{user?.name || 'User'}</div>
                <div className="text-xs text-muted">{user?.role || 'STUDENT'}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
                aria-label="Log out"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
                aria-label="Go to login"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-white/10 bg-gold/15 px-3 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
                aria-label="Go to register"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
