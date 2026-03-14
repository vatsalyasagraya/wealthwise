'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Skeleton, { SkeletonRow } from '@/components/Skeleton'
import { PlusIcon, PencilIcon, TrashIcon, TrendingUpIcon } from '@/components/Icons'

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'ETF', 'Gold']

const TYPE_BADGE = {
  Stocks:        'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  'Mutual Funds':'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  ETF:           'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Gold:          'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
}

const TYPE_CHART_COLORS = {
  Stocks: '#6366f1', 'Mutual Funds': '#a855f7', ETF: '#22c55e', Gold: '#eab308',
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useUser()
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState('Stocks')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')

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
    if (error) setMessage(error.message)
    else { setName(''); setAmount(''); setType('Stocks'); setShowForm(false); fetchInvestments(user.id) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('investments').delete().eq('id', id)
    fetchInvestments(user.id)
  }

  const handleUpdateAmount = async (id) => {
    const val = parseFloat(editAmount)
    if (!val || val <= 0) { setEditingId(null); return }
    await supabase.from('investments').update({ amount: val }).eq('id', id)
    setEditingId(null)
    fetchInvestments(user.id)
  }

  const total = investments.reduce((s, i) => s + i.amount, 0)
  const byType = investments.reduce((a, i) => ({ ...a, [i.type]: (a[i.type] || 0) + i.amount }), {})
  const chartData = Object.entries(byType).map(([name, value]) => ({ name, value }))

  if (authLoading) return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
      <Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" />
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 fade-in">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Track all your investments in one place</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">
          {showForm ? 'Cancel' : <><PlusIcon className="w-4 h-4" /> Add</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">New Investment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1.5">Name</label>
              <input type="text" placeholder="e.g. Nifty 50 Index Fund"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1.5">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                {INVESTMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1.5">Current Value ({'\u20B9'})</label>
            <input type="number" placeholder="e.g. 25000"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          {message && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">{message}</p>}
          <button onClick={handleAdd} disabled={saving}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Investment'}
          </button>
        </div>
      )}

      {/* Total card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Total Portfolio Value</p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{'\u20B9'}{total.toLocaleString('en-IN')}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{investments.length} investments</p>
      </div>

      {/* Pie chart */}
      {!loading && investments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} stroke="none"
                paddingAngle={3} dataKey="value">
                {chartData.map((e) => <Cell key={e.name} fill={TYPE_CHART_COLORS[e.name] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v) => [`\u20B9${v.toLocaleString('en-IN')}`, '']} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
            {chartData.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: TYPE_CHART_COLORS[e.name] || '#94a3b8' }} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{e.name}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{((e.value / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Holdings</h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-3"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
        ) : investments.length === 0 ? (
          <div className="text-center py-12 px-6">
            <TrendingUpIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No investments yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Click "Add" above to get started</p>
          </div>
        ) : (
          <>
            {/* Table header — hidden on mobile */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">Type</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-5">Value</div>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {investments.map((inv) => (
                <div key={inv.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">

                  {/* Type badge */}
                  <div className="sm:col-span-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${TYPE_BADGE[inv.type]}`}>
                      {inv.type}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="sm:col-span-5">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{inv.name}</span>
                  </div>

                  {/* Value + inline actions */}
                  <div className="sm:col-span-5 flex items-center gap-2">
                    {editingId === inv.id ? (
                      <input
                         type="number"
                         value={editAmount}
                         onChange={(e) => setEditAmount(e.target.value)}
                         onBlur={() => handleUpdateAmount(inv.id)}
                         onKeyDown={(e) => e.key === 'Enter' && handleUpdateAmount(inv.id)}
                         autoFocus
                         className="w-28 border border-indigo-300 dark:border-indigo-600 rounded px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-slate-800 dark:text-white"
                      />
                    ) : (
                      <span
                        className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={() => { setEditingId(inv.id); setEditAmount(inv.amount) }}
                        title="Click to edit"
                      >
                        {'\u20B9'}{inv.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                    <button
                      onClick={() => { setEditingId(inv.id); setEditAmount(inv.amount) }}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                      title="Edit value"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                      title="Delete"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
