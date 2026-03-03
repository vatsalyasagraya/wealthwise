'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Skeleton, { SkeletonRow } from '@/components/Skeleton'

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'ETF', 'Gold']

const TYPE_BADGE = {
  Stocks:       'bg-indigo-100 text-indigo-700',
  'Mutual Funds':'bg-purple-100 text-purple-700',
  ETF:          'bg-emerald-100 text-emerald-700',
  Gold:         'bg-yellow-100 text-yellow-700',
}

const TYPE_CHART_COLORS = {
  Stocks: '#6366f1', 'Mutual Funds': '#a855f7', ETF: '#22c55e', Gold: '#eab308',
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useUser()
  const [investments, setInvestments]  = useState([])
  const [loading, setLoading]          = useState(true)
  const [showForm, setShowForm]        = useState(false)

  // Add form
  const [name, setName]   = useState('')
  const [type, setType]   = useState('Stocks')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Inline edit
  const [editingId, setEditingId]     = useState(null)
  const [editAmount, setEditAmount]   = useState('')

  useEffect(() => { if (user) fetchInvestments(user.id) }, [user])

  const fetchInvestments = async (uid) => {
    setLoading(true)
    const { data } = await supabase.from('investments').select('*')
      .eq('user_id', uid).order('created_at', { ascending: false })
    setInvestments(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!name || !amount) { setMessage('Please fill in all fields.'); return }
    setSaving(true)
    const { error } = await supabase.from('investments').insert({
      user_id: user.id, name, type, amount: parseFloat(amount),
    })
    if (error) { setMessage(error.message) }
    else { setName(''); setAmount(''); setType('Stocks'); setShowForm(false); fetchInvestments(user.id) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('investments').delete().eq('id', id)
    fetchInvestments(user.id)
  }

  // Inline edit save
  const handleUpdateAmount = async (id) => {
    const val = parseFloat(editAmount)
    if (!val || val <= 0) { setEditingId(null); return }
    await supabase.from('investments').update({ amount: val }).eq('id', id)
    setEditingId(null)
    fetchInvestments(user.id)
  }

  const total     = investments.reduce((s, i) => s + i.amount, 0)
  const byType    = investments.reduce((a, i) => ({ ...a, [i.type]: (a[i.type] || 0) + i.amount }), {})
  const chartData = Object.entries(byType).map(([name, value]) => ({ name, value }))

  if (authLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" />
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6 fade-in">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Portfolio Tracker</h2>
          <p className="text-slate-500 text-sm mt-1">Track all your investments in one place</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">New Investment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Name</label>
              <input type="text" placeholder="e.g. Nifty 50 Index Fund"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all">
                {INVESTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Current Value (₹)</label>
            <input type="number" placeholder="e.g. 25000"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
          </div>
          {message && <p className="text-red-500 text-sm">{message}</p>}
          <button onClick={handleAdd} disabled={saving}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Investment'}
          </button>
        </div>
      )}

      {/* Total card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200/40">
        <p className="text-indigo-200 text-sm">Total Portfolio Value</p>
        <h2 className="text-3xl font-bold mt-1 tracking-tight">₹{total.toLocaleString('en-IN')}</h2>
        <p className="text-indigo-200 text-sm mt-1">{investments.length} investments</p>
      </div>

      {/* Pie chart */}
      {!loading && investments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                paddingAngle={3} dataKey="value">
                {chartData.map((e) => <Cell key={e.name} fill={TYPE_CHART_COLORS[e.name] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">
            {chartData.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_CHART_COLORS[e.name] || '#94a3b8' }} />
                <span className="text-xs text-slate-600">{e.name}</span>
                <span className="text-xs font-semibold text-slate-800">{((e.value / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investments list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Your Investments</h3>
        {loading ? (
          <div className="space-y-3"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
        ) : investments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">💼</p>
            <p className="text-slate-500 text-sm font-medium">No investments yet</p>
            <p className="text-slate-400 text-xs mt-0.5">Click "+ Add" above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {investments.map((inv) => (
              <div key={inv.id}
                className="flex items-center gap-2 px-3 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">

                {/* Left: badge + name (min-w-0 allows truncation) */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${TYPE_BADGE[inv.type]}`}>
                    {inv.type}
                  </span>
                  <span className="text-sm font-medium text-slate-800 truncate">{inv.name}</span>
                </div>

                {/* Right: value + action buttons (flex-shrink-0 keeps it from overflowing) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {editingId === inv.id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onBlur={() => handleUpdateAmount(inv.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateAmount(inv.id)}
                      autoFocus
                      className="w-24 border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-right"
                    />
                  ) : (
                    <span
                      className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => { setEditingId(inv.id); setEditAmount(inv.amount) }}
                      title="Click to edit"
                    >
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                  {/* Pencil — desktop hover-only, always visible on mobile */}
                  <button
                    onClick={() => { setEditingId(inv.id); setEditAmount(inv.amount) }}
                    className="sm:opacity-0 sm:group-hover:opacity-100 opacity-100 text-slate-400 hover:text-indigo-500 transition-all p-1"
                    title="Edit value"
                  >
                    ✏️
                  </button>
                  {/* Delete — always visible */}
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="sm:opacity-0 sm:group-hover:opacity-100 opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
