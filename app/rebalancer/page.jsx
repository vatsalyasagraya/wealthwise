'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import Skeleton, { SkeletonCard } from '@/components/Skeleton'
import { ScaleIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/Icons'

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'ETF', 'Gold']
const TYPE_COLORS = { Stocks: '#6366f1', 'Mutual Funds': '#a855f7', ETF: '#22c55e', Gold: '#eab308' }

export default function RebalancerPage() {
  const { user, loading: authLoading } = useUser()
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)

  const [targets, setTargets] = useState(
    INVESTMENT_TYPES.reduce((a, t) => ({ ...a, [t]: 25 }), {})
  )

  useEffect(() => { if (user) fetchInvestments() }, [user])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data } = await supabase.from('investments').select('*').eq('user_id', user.id)
    setInvestments(data || [])
    setLoading(false)
  }

  const total = investments.reduce((s, i) => s + i.amount, 0)
  const actual = INVESTMENT_TYPES.reduce((a, t) => ({
    ...a,
    [t]: total > 0 ? (investments.filter(i => i.type === t).reduce((s, i) => s + i.amount, 0) / total) * 100 : 0,
  }), {})

  const handleTargetChange = (changedType, rawValue) => {
    const newVal = Math.min(100, Math.max(0, parseInt(rawValue) || 0))
    const remaining = 100 - newVal
    const others = INVESTMENT_TYPES.filter((t) => t !== changedType)
    const othersTotal = others.reduce((s, t) => s + targets[t], 0)

    const newTargets = { ...targets, [changedType]: newVal }
    let assigned = 0

    others.forEach((t, i) => {
      if (i === others.length - 1) {
        newTargets[t] = Math.max(0, remaining - assigned)
      } else if (othersTotal === 0) {
        const share = i < remaining % others.length
          ? Math.floor(remaining / others.length) + 1
          : Math.floor(remaining / others.length)
        newTargets[t] = share
        assigned += share
      } else {
        const share = Math.floor((targets[t] / othersTotal) * remaining)
        newTargets[t] = share
        assigned += share
      }
    })

    setTargets(newTargets)
  }

  const suggestions = INVESTMENT_TYPES.map((t) => {
    const actualAmt = investments.filter(i => i.type === t).reduce((s, i) => s + i.amount, 0)
    const targetAmt = (targets[t] / 100) * total
    const diff = targetAmt - actualAmt
    return { type: t, actual: actualAmt, target: targetAmt, diff, action: diff > 100 ? 'BUY' : diff < -100 ? 'SELL' : 'HOLD' }
  })

  const radarData = INVESTMENT_TYPES.map((t) => ({
    type: t, target: targets[t], actual: parseFloat(actual[t].toFixed(1)),
  }))

  if (authLoading) return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-4"><SkeletonCard /><SkeletonCard /></div>
  )
  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 fade-in">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rebalancer</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Set target allocations and get buy/sell recommendations</p>
      </div>

      {loading ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : investments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-12 text-center">
          <ScaleIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-semibold">No investments to rebalance</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Add some investments first to use the rebalancer.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── Target Allocation Sliders ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Target Allocation</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Adjust sliders — total always equals 100%</p>

            <div className="space-y-5">
              {INVESTMENT_TYPES.map((type) => (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[type] }} />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{type}</label>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{targets[type]}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={targets[type]}
                    onChange={(e) => handleTargetChange(type, e.target.value)}
                    className="w-full h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <span>Actual: {actual[type].toFixed(1)}%</span>
                    <span>Target: {targets[type]}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Radar Chart ── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Target vs. Actual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 12, fill: '#64748b' }} />
                <Radar name="Target" dataKey="target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Actual" dataKey="actual" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-indigo-500 rounded" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-slate-400 rounded" style={{ borderTop: '2px dashed #94a3b8' }} />
                <span className="text-xs text-slate-500 dark:text-slate-400">Actual</span>
              </div>
            </div>
          </div>

          {/* ── Recommendations Table ── */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recommendations</h3>
            </div>

            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-6 gap-4 px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <div className="col-span-1">Type</div>
              <div className="col-span-1 text-right">Current</div>
              <div className="col-span-1 text-right">Target</div>
              <div className="col-span-1 text-right">Difference</div>
              <div className="col-span-1 text-center">Action</div>
              <div className="col-span-1 text-right">Amount</div>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {suggestions.map((s) => (
                <div key={s.type} className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 items-center px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Type */}
                  <div className="sm:col-span-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[s.type] }} />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.type}</span>
                  </div>

                  {/* Current */}
                  <div className="sm:col-span-1 text-right">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{'\u20B9'}{s.actual.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Target */}
                  <div className="sm:col-span-1 text-right">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{'\u20B9'}{Math.round(s.target).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Diff */}
                  <div className="sm:col-span-1 text-right">
                    <span className={`text-sm font-medium ${s.diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : s.diff < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {s.diff > 0 ? '+' : ''}{'\u20B9'}{Math.round(Math.abs(s.diff)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Action badge */}
                  <div className="sm:col-span-1 flex justify-center">
                    {s.action === 'BUY' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <ArrowUpIcon className="w-3 h-3" /> BUY
                      </span>
                    )}
                    {s.action === 'SELL' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                        <ArrowDownIcon className="w-3 h-3" /> SELL
                      </span>
                    )}
                    {s.action === 'HOLD' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                        HOLD
                      </span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="sm:col-span-1 text-right">
                    <span className={`text-sm font-semibold ${s.action === 'BUY' ? 'text-emerald-700 dark:text-emerald-500' : s.action === 'SELL' ? 'text-red-600 dark:text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                      {s.action === 'HOLD' ? '—' : `\u20B9${Math.round(Math.abs(s.diff)).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
