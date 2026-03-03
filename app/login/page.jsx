'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin]   = useState(true)
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('✅ Account created! You can now log in.')
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAuth()
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-white/5 rounded-full" />

        {/* Top: Logo */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WealthWise</h1>
          <p className="text-indigo-200 mt-2 text-sm">Smart wealth building for young India</p>
        </div>

        {/* Middle: Features */}
        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Take control of<br />your financial future.
          </h2>
          <div className="space-y-4 mt-6">
            {[
              { icon: '📊', title: 'Portfolio Tracker', desc: 'Track stocks, mutual funds, ETFs & gold in one place' },
              { icon: '🎯', title: 'Savings Goals',     desc: 'Set targets, add money, watch your progress grow' },
              { icon: '⚖️', title: 'Smart Rebalancer', desc: 'Get precise buy/sell suggestions to hit your target allocation' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Tag */}
        <p className="text-indigo-300 text-xs relative z-10">
          Built for Indian investors · INR native · Supabase powered
        </p>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <h1 className="lg:hidden text-2xl font-bold text-indigo-600 mb-8 text-center">WealthWise</h1>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin ? 'Sign in to your account' : 'Start tracking your wealth today'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {['Login', 'Sign Up'].map((label) => (
              <button
                key={label}
                onClick={() => { setIsLogin(label === 'Login'); setMessage('') }}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${(label === 'Login') === isLogin
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <input
                type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleAuth} disabled={loading}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition-all duration-150 disabled:opacity-50 shadow-sm shadow-indigo-200"
          >
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create Account'}
          </button>

          {/* Message */}
          {message && (
            <p className={`mt-4 text-center text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          {/* Footer hint */}
          <p className="mt-8 text-center text-xs text-slate-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setMessage('') }}
              className="text-indigo-500 font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
