'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import {
  HomeIcon, BarChartIcon, TargetIcon, ScaleIcon,
  LogOutIcon, MenuIcon, XIcon, UserIcon, SunIcon, MoonIcon,
} from '@/components/Icons'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    links: [
      { path: '/dashboard',  label: 'Dashboard',  Icon: HomeIcon },
      { path: '/portfolio',  label: 'Portfolio',   Icon: BarChartIcon },
    ],
  },
  {
    label: 'Tools',
    links: [
      { path: '/goals',      label: 'Goals',       Icon: TargetIcon },
      { path: '/rebalancer', label: 'Rebalancer',  Icon: ScaleIcon },
    ],
  },
]

export default function Sidebar({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path) => pathname === path

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'
  const email = user?.email ?? ''

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-lg font-bold text-slate-900 dark:text-white cursor-pointer tracking-tight select-none"
        >
          WealthWise
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Investment Tracker</p>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map(({ path, label, Icon }) => (
                <button
                  key={path}
                  onClick={() => { router.push(path); setMobileOpen(false) }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(path)
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive(path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 mt-auto space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'dark'
            ? <SunIcon className="w-[18px] h-[18px]" />
            : <MoonIcon className="w-[18px] h-[18px]" />
          }
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOutIcon className="w-[18px] h-[18px]" />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[240px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-40">
        {navContent}
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-14 flex items-center justify-between px-4">
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-base font-bold text-slate-900 dark:text-white cursor-pointer tracking-tight select-none"
        >
          WealthWise
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <SunIcon className="w-5 h-5 text-slate-400" />
              : <MoonIcon className="w-5 h-5 text-slate-700" />
            }
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <MenuIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/30 z-40 sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile Drawer ── */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-50 flex flex-col sidebar-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="absolute top-4 right-3">
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <XIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  )
}
