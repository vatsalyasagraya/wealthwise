'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path) => pathname === path

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/portfolio', label: 'Portfolio',  icon: '📊' },
    { path: '/goals',     label: 'Goals',      icon: '🎯' },
    { path: '/rebalancer',label: 'Rebalancer', icon: '⚖️' },
  ]

  // Get initials from email for avatar
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-0 h-16 flex justify-between items-center">

        {/* Logo */}
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-xl font-bold cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent select-none"
        >
          WealthWise
        </h1>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-150
                ${isActive(link.path)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
              `}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>

        {/* Desktop: Avatar + Logout */}
        <div className="hidden md:flex items-center gap-3">
          {/* User avatar — shows initials */}
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-600">{initials}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-slate-600 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-slate-600 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-slate-600 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { router.push(link.path); setMenuOpen(false) }}
              className={`
                w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'}
              `}
            >
              {link.icon} {link.label}
            </button>
          ))}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">{initials}</span>
              </div>
              <span className="text-xs text-slate-400 truncate max-w-[180px]">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:text-red-600">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
