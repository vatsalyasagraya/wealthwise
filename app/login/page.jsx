'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BarChartIcon, TargetIcon, ScaleIcon, SunIcon, MoonIcon, TrendingUpIcon } from '@/components/Icons'
import { useTheme } from '@/components/ThemeProvider'

export default function LoginPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const action = isLogin
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })

    const { error } = await action
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  const features = [
    { Icon: BarChartIcon, title: 'Portfolio Tracker', desc: 'Track stocks, mutual funds, ETFs & gold in one place' },
    { Icon: TargetIcon, title: 'Savings Goals', desc: 'Set targets, add money, watch your progress grow' },
    { Icon: ScaleIcon, title: 'Smart Rebalancer', desc: 'Get precise buy/sell suggestions to hit target allocation' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* ── Mobile Top Bar (with Theme Toggle) ── */}
      <div className="lg:hidden flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUpIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">WealthWise</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="w-4.5 h-4.5" /> : <MoonIcon className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* ── Left Panel (Hero) ── */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between bg-slate-900 text-white p-10 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-3xl"></div>
          <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">WealthWise</h1>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="w-4.5 h-4.5" /> : <MoonIcon className="w-4.5 h-4.5" />}
          </button>
        </div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-4xl font-bold leading-[1.15] tracking-tight">
            Take control of<br />your financial future.
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-[85%]">
            The beautiful, simple way to track your net worth and optimize your asset allocation.
          </p>
          
          <div className="space-y-5 mt-10 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 relative z-10">
          Built for modern investors · Secure & private
        </p>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent p-8 lg:p-0 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 lg:shadow-none border border-slate-100 dark:border-slate-800 lg:border-none">
          
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isLogin ? 'Enter your credentials to access your account' : 'Start your journey to financial clarity today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex gap-2 items-start mt-2">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white pt-3 pb-3 rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 dark:shadow-none
                hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in to WealthWise' : 'Create account')}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-8">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
