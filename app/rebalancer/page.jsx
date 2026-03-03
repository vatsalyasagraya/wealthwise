'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Skeleton from '@/components/Skeleton'

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'ETF', 'Gold']

const TYPE_COLORS = {
  Stocks: '#6366f1', 'Mutual Funds': '#a855f7', ETF: '#22c55e', Gold: '#eab308',
}

const DEFAULT_TARGETS = { Stocks: 50, 'Mutual Funds': 30, ETF: 10, Gold: 10 }

export default function RebalancerPage() {
  const { user, loading: authLoading } = useUser()
  const [investments, setInvestments]  = useState([])
  const [loading, setLoading]          = useState(true)
  const [targets, setTargets]          = useState(DEFAULT_TARGETS)

  useEffect(() => { if (user) fetchInvestments() }, [user])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data } = await supabase.from('investments').select('*').eq('user_id', user.id)
    setInvestments(data || [])
    setLoading(false)
  }

  const byType         = investments.reduce((a, i) => ({ ...a, [i.type]: (a[i.type] || 0) + i.amount }), {})
  const totalPortfolio = investments.reduce((s, i) => s + i.amount, 0)
  const actual         = INVESTMENT_TYPES.reduce((a, t) => ({
    ...a, [t]: totalPortfolio > 0 ? ((byType[t] || 0) / totalPortfolio) * 100 : 0,
  }), {})

  // Auto-balance: when one slider moves, distribute the remaining %
  // proportionally among the other three sliders.
  // Uses Math.floor (not Math.round) for non-last items so that
  // "assigned" can never exceed "remaining" → no negatives, total always = 100.
  const handleTargetChange = (changedType, rawValue) => {
    const newVal = Math.min(100, Math.max(0, parseInt(rawValue) || 0))
    const remaining = 100 - newVal
    const others = INVESTMENT_TYPES.filter((t) => t !== changedType)
    const othersTotal = others.reduce((s, t) => s + targets[t], 0)

    const newTargets = { ...targets, [changedType]: newVal }
    let assigned = 0

    others.forEach((t, i) => {
      if (i === others.length - 1) {
        // Last gets the exact remainder so sum is always 100
        newTargets[t] = Math.max(0, remaining - assigned)
      } else if (othersTotal === 0) {
        // All others are 0 → distribute evenly
        const share = i < remaining % others.length
          ? Math.floor(remaining / others.length) + 1
          : Math.floor(remaining / others.length)
        newTargets[t] = share
        assigned += share
      } else {
        // Proportional — floor guarantees assigned <= remaining
        const share = Math.floor((targets[t] / othersTotal) * remaining)
        newTargets[t] = share
        assigned += share
      }
    })

    setTargets(newTargets)
  }

  const suggestions = INVESTMENT_TYPES.map((type) => {
    const targetAmt = (targets[type] / 100) * totalPortfolio
    const actualAmt = byType[type] || 0
    return { type, targetPercent: targets[type], actualPercent: actual[type], diff: targetAmt - actualAmt }
  })

  const radarData = INVESTMENT_TYPES.map((type) => ({
    type, Target: targets[type], Actual: parseFloat(actual[type].toFixed(1)),
  }))

  if (authLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" />
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Portfolio Rebalancer</h2>
        <p className="text-slate-500 text-sm mt-1">Set target allocation — sliders auto-balance to 100%</p>
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-64 w-full" /></div>
      ) : investments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">⚖️</p>
          <p className="text-slate-700 font-semibold">No investments yet</p>
          <p className="text-slate-400 text-sm mt-1">Add investments in the Portfolio tab to use the rebalancer.</p>
        </div>
      ) : (
        <>
          {/* Sliders */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Target Allocation</h3>
              {/* Always 100% — show green tick */}
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Total: 100% ✓
              </span>
            </div>

            {INVESTMENT_TYPES.map((type) => (
              <div key={type}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[type] }} />
                    <label className="text-sm font-medium text-slate-700">{type}</label>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{targets[type]}%</span>
                </div>
                {/* Single consistent accent color avoids black/white on Safari/iOS */}
                <input type="range" min="0" max="100" value={targets[type]}
                  onChange={(e) => handleTargetChange(type, e.target.value)}
                  className="w-full h-2 cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Actual: {actual[type].toFixed(1)}%</span>
                  <span>Target: {targets[type]}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Target vs Actual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 12, fill: '#64748b' }} />
                <Radar name="Target" dataKey="Target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Actual" dataKey="Actual" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /><span className="text-xs text-slate-500">Target</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-xs text-slate-500">Actual</span></div>
            </div>
          </div>

          {/* Buy/Sell suggestions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">📋 What to do</h3>
            <div className="space-y-3">
              {suggestions.map((s) => {
                const onTarget = Math.abs(s.diff) < 500
                const isBuy    = s.diff > 0
                return (
                  <div key={s.type}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      onTarget ? 'bg-slate-50 border-slate-100'
                      : isBuy  ? 'bg-emerald-50 border-emerald-100'
                               : 'bg-red-50 border-red-100'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: TYPE_COLORS[s.type] }} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.type}</p>
                        <p className="text-xs text-slate-400">{s.actualPercent.toFixed(1)}% actual → {s.targetPercent}% target</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {onTarget ? (
                        <span className="text-xs font-medium text-slate-400">✅ On track</span>
                      ) : (
                        <>
                          <span className={`text-sm font-bold ${isBuy ? 'text-emerald-600' : 'text-red-500'}`}>
                            {isBuy ? '▲ BUY' : '▼ SELL'}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">₹{Math.abs(s.diff).toLocaleString('en-IN')}</p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              Based on portfolio value of ₹{totalPortfolio.toLocaleString('en-IN')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
