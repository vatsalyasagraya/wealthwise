'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'ETF', 'Gold']

const TYPE_COLORS = {
  'Stocks': '#6366f1',
  'Mutual Funds': '#a855f7',
  'ETF': '#22c55e',
  'Gold': '#eab308',
}

const DEFAULT_TARGETS = {
  'Stocks': 50,
  'Mutual Funds': 30,
  'ETF': 10,
  'Gold': 10,
}

export default function RebalancerPage() {
  const { user, loading: authLoading } = useUser()
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [targets, setTargets] = useState(DEFAULT_TARGETS)
  const [totalTarget, setTotalTarget] = useState(100)

  useEffect(() => {
    if (user) fetchInvestments()
  }, [user])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('investments').select('*').eq('user_id', user.id)
    if (error) console.error(error)
    else setInvestments(data)
    setLoading(false)
  }

  const byType = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.amount; return acc
  }, {})

  const totalPortfolio = investments.reduce((sum, inv) => sum + inv.amount, 0)

  const actual = INVESTMENT_TYPES.reduce((acc, type) => {
    acc[type] = totalPortfolio > 0 ? ((byType[type] || 0) / totalPortfolio) * 100 : 0; return acc
  }, {})

  const suggestions = INVESTMENT_TYPES.map((type) => {
    const targetAmount = (targets[type] / 100) * totalPortfolio
    const actualAmount = byType[type] || 0
    const diff = targetAmount - actualAmount
    return { type, targetPercent: targets[type], actualPercent: actual[type], targetAmount, actualAmount, diff }
  })

  const handleTargetChange = (type, value) => {
    const newTargets = { ...targets, [type]: parseInt(value) }
    const total = Object.values(newTargets).reduce((sum, v) => sum + v, 0)
    setTargets(newTargets)
    setTotalTarget(total)
  }

  const radarData = INVESTMENT_TYPES.map((type) => ({
    type,
    Target: targets[type],
    Actual: parseFloat(actual[type].toFixed(1)),
  }))

  const isTotalValid = totalTarget === 100

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>
  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Portfolio Rebalancer</h2>
        <p className="text-gray-500 text-sm mt-1">Set your target allocation and see exactly what to buy or sell</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading...</p>
      ) : investments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-gray-500 text-sm">Add some investments first to use the rebalancer.</p>
        </div>
      ) : (
        <>
          {/* Target Allocation Sliders */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Set Target Allocation</h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${isTotalValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                Total: {totalTarget}% {isTotalValid ? '✓' : '(must be 100%)'}
              </span>
            </div>
            {INVESTMENT_TYPES.map((type) => (
              <div key={type}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">{type}</label>
                  <span className="text-sm font-bold" style={{ color: TYPE_COLORS[type] }}>{targets[type]}%</span>
                </div>
                <input type="range" min="0" max="100" value={targets[type]}
                  onChange={(e) => handleTargetChange(type, e.target.value)}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Actual: {actual[type].toFixed(1)}%</span>
                  <span>Target: {targets[type]}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Target vs Actual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" tick={{ fontSize: 12 }} />
                <Radar name="Target" dataKey="Target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Radar name="Actual" dataKey="Actual" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /><span className="text-xs text-gray-500">Target</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-xs text-gray-500">Actual</span></div>
            </div>
          </div>

          {/* Suggestions */}
          {isTotalValid && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📋 What to do</h3>
              <div className="space-y-3">
                {suggestions.map((s) => {
                  const isOnTarget = Math.abs(s.diff) < 500
                  const isBuy = s.diff > 0
                  return (
                    <div key={s.type} className={`flex items-center justify-between p-4 rounded-xl ${isOnTarget ? 'bg-gray-50' : isBuy ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: TYPE_COLORS[s.type] }} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.type}</p>
                          <p className="text-xs text-gray-400">{s.actualPercent.toFixed(1)}% actual → {s.targetPercent}% target</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isOnTarget ? (
                          <span className="text-xs font-medium text-gray-400">✅ On track</span>
                        ) : (
                          <>
                            <span className={`text-sm font-bold ${isBuy ? 'text-green-600' : 'text-red-500'}`}>{isBuy ? '▲ BUY' : '▼ SELL'}</span>
                            <p className="text-xs text-gray-500">₹{Math.abs(s.diff).toLocaleString('en-IN')}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                * Based on your current portfolio value of ₹{totalPortfolio.toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
