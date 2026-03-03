'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Skeleton, { SkeletonCard } from '@/components/Skeleton'

const TYPE_COLORS_BAR = { Stocks: '#6366f1', 'Mutual Funds': '#a855f7', ETF: '#22c55e', Gold: '#eab308' }
const TYPE_DOT_COLORS  = { Stocks: 'bg-indigo-500', 'Mutual Funds': 'bg-purple-500', ETF: 'bg-green-500', Gold: 'bg-yellow-500' }

// Derive a display name from email (everything before @)
const getDisplayName = (email) => {
  if (!email) return 'there'
  const raw = email.split('@')[0].replace(/[._-]/g, ' ')
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const formatDate = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser()
  const [investments, setInvestments] = useState([])
  const [goals, setGoals]             = useState([])
  const [loading, setLoading]         = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) { fetchInvestments(); fetchGoals() }
  }, [user])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data } = await supabase.from('investments').select('*').eq('user_id', user.id)
    setInvestments(data || [])
    setLoading(false)
  }

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(3)
    setGoals(data || [])
  }

  const netWorth = investments.reduce((s, i) => s + i.amount, 0)
  const byType   = investments.reduce((a, i) => ({ ...a, [i.type]: (a[i.type] || 0) + i.amount }), {})
  const portfolio = Object.entries(byType).map(([name, value]) => ({ name, value }))

  if (authLoading) return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <SkeletonCard /><SkeletonCard />
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 fade-in">

      {/* ── Greeting ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {getGreeting()}, {getDisplayName(user.email)} 👋
        </h2>
        <p className="text-slate-500 text-sm mt-1">{formatDate()}</p>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📊', label: 'Add Investment', href: '/portfolio', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
          { icon: '🎯', label: 'New Goal',        href: '/goals',    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
          { icon: '⚖️', label: 'Rebalance',      href: '/rebalancer',bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-100' },
        ].map((a) => (
          <button
            key={a.href}
            onClick={() => router.push(a.href)}
            className={`${a.bg} ${a.text} border ${a.border} rounded-2xl p-4 text-left hover:shadow-sm transition-all duration-150 hover:-translate-y-0.5`}
          >
            <span className="text-2xl">{a.icon}</span>
            <p className="text-sm font-semibold mt-2">{a.label}</p>
          </button>
        ))}
      </div>

      {/* ── Net Worth ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200/40">
        <p className="text-indigo-200 text-sm font-medium">Total Net Worth</p>
        {loading
          ? <Skeleton className="h-10 w-48 mt-2 bg-white/20" />
          : <h2 className="text-4xl font-bold mt-1 tracking-tight">₹{netWorth.toLocaleString('en-IN')}</h2>
        }
        <p className="text-indigo-200 text-sm mt-2">{investments.length} investments tracked</p>
      </div>

      {/* ── Portfolio Breakdown ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-slate-900">Portfolio Breakdown</h3>
          <button onClick={() => router.push('/portfolio')} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
            Manage →
          </button>
        </div>

        {loading ? (
          <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-40 w-full" /></div>
        ) : investments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-slate-500 text-sm font-medium">No investments yet</p>
            <p className="text-slate-400 text-xs mt-0.5 mb-4">Start building your portfolio</p>
            <button onClick={() => router.push('/portfolio')}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
              + Add Investment
            </button>
          </div>
        ) : (
          <>
            {/* Allocation bar */}
            <div className="flex rounded-full overflow-hidden h-3 mb-5">
              {portfolio.map((item) => (
                <div key={item.name}
                  className={`${TYPE_DOT_COLORS[item.name] || 'bg-slate-400'} transition-all`}
                  style={{ width: `${(item.value / netWorth) * 100}%` }} />
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={portfolio} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Value']} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {portfolio.map((e) => <Cell key={e.name} fill={TYPE_COLORS_BAR[e.name] || '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {portfolio.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT_COLORS[item.name] || 'bg-slate-400'}`} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">₹{item.value.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">{((item.value / netWorth) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Savings Goals Preview ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-slate-900">Savings Goals</h3>
          <button onClick={() => router.push('/goals')} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors">View all →</button>
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-slate-500 text-sm">No goals yet.{' '}
              <button onClick={() => router.push('/goals')} className="text-indigo-500 font-medium hover:underline">Create one →</button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
              const done = pct === 100
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{goal.emoji} {goal.name}</span>
                    <span className="text-xs text-slate-400">
                      ₹{goal.saved_amount.toLocaleString('en-IN')} / ₹{goal.target_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-right text-slate-400">
                    {done ? '✅ Goal reached!' : `${pct.toFixed(0)}% there`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
