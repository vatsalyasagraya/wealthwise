import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/dashboard', label: '🏠 Dashboard' },
    { path: '/portfolio', label: '📊 Portfolio' },
    { path: '/goals', label: '🎯 Goals' },
    { path: '/rebalancer', label: '⚖️ Rebalancer' },
  ]

  const handleNavigate = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm px-6 py-4">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <h1
          onClick={() => navigate('/dashboard')}
          className="text-xl font-bold text-indigo-600 cursor-pointer"
        >
          WealthWise
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-sm font-medium transition-all ${
                isActive(link.path)
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-indigo-500'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop User + Logout */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-2 border-t pt-4">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavigate(link.path)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="border-t pt-3 mt-2 flex justify-between items-center px-4">
            <span className="text-xs text-gray-400 truncate max-w-[200px]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}