'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Skeleton, { SkeletonCard } from '@/components/Skeleton'
import { PlusIcon, TargetIcon, ScaleIcon, TrendingUpIcon, ChevronRightIcon } from '@/components/Icons'

const TYPE_COLORS = { Stocks: '#6366f1', 'Mutual Funds': '#a855f7', ETF: '#22c55e', Gold: '#eab308' }

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
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
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
  const byType = investments.reduce((a, i) => ({ ...a, [i.type]: (a[i.type] || 0) + i.amount }), {})
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {getGreeting()}, {getDisplayName(user.email)}
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{formatDate()}</p>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { Icon: PlusIcon, label: 'Add Investment', desc: 'Track a new asset', href: '/portfolio', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { Icon: TargetIcon, label: 'New Goal', desc: 'Start saving for something', href: '/goals', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { Icon: ScaleIcon, label: 'Rebalance', desc: 'Optimize your allocation', href: '/rebalancer', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        ].map((a) => (
          <button
            key={a.href}
            onClick={() => router.push(a.href)}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-4 text-left hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm dark:hover:shadow-none transition-all duration-150 group"
          >
            <div className={`w-10 h-10 ${a.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <a.Icon className={`w-5 h-5 ${a.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{a.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{a.desc}</p>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* ── Net Worth ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Total Net Worth</p>
        {loading
          ? <Skeleton className="h-10 w-48 mt-2" />
          : <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{'\u20B9'}{netWorth.toLocaleString('en-IN')}</h2>
        }
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{investments.length} investments tracked</p>
      </div>

      {/* ── Portfolio Breakdown ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio Breakdown</h3>
          <button onClick={() => router.push('/portfolio')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
            Manage
          </button>
        </div>

        {loading ? (
          <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-40 w-full" /></div>
        ) : investments.length === 0 ? (
          <div className="text-center py-10">
            <TrendingUpIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No investments yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 mb-4">Start building your portfolio</p>
            <button onClick={() => router.push('/portfolio')}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">
              Add Investment
            </button>
          </div>
        ) : (
          <>
            {/* Allocation bar */}
            <div className="flex rounded-full overflow-hidden h-2 mb-5">
              {portfolio.map((item) => (
                <div key={item.name}
                  className="transition-all"
                  style={{ width: `${(item.value / netWorth) * 100}%`, backgroundColor: TYPE_COLORS[item.name] || '#94a3b8' }} />
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={portfolio} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `\u20B9${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`\u20B9${v.toLocaleString('en-IN')}`, 'Value']} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {portfolio.map((e) => <Cell key={e.name} fill={TYPE_COLORS[e.name] || '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
              {portfolio.map((item) => (
                <div key={item.name} className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[item.name] || '#94a3b8' }} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{'\u20B9'}{item.value.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{((item.value / netWorth) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Savings Goals Preview ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Savings Goals</h3>
          <button onClick={() => router.push('/goals')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
            View all
          </button>
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <TargetIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No goals yet.{' '}
              <button onClick={() => router.push('/goals')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Create one</button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
              const done = pct === 100
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{goal.name}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {'\u20B9'}{goal.saved_amount.toLocaleString('en-IN')} / {'\u20B9'}{goal.target_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-right text-slate-400 dark:text-slate-500">
                    {done ? 'Goal reached' : `${pct.toFixed(0)}% complete`}
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
