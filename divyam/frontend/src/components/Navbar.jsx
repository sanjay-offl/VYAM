import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function NavItem({ to, children, ariaLabel }) {
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `nav-item transition-all duration-200 ${
          isActive
            ? 'bg-purple-100/30 text-purple-900 font-medium'
            : 'text-gray-600 hover:text-purple-900 hover:bg-purple-50/40'
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
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-lg border-b border-purple-200/30 shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-lg px-2 py-1 text-lg font-bold tracking-tight focus:outline-none transition-all hover:opacity-80"
            aria-label="Go to DIVYAM Home"
          >
            <span className="gradient-text">DIVYAM</span>
            <span className="ml-2 hidden text-sm text-gray-600 font-normal md:inline">
              Accessible Learning Platform
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

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden text-right md:block">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'STUDENT'}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="btn btn-outline btn-sm"
                aria-label="Log out"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn btn-outline btn-sm"
                aria-label="Go to login"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
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
