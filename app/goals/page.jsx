'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import Skeleton, { SkeletonCard } from '@/components/Skeleton'

const EMOJI_OPTIONS = ['🎯', '✈️', '💻', '📱', '🏠', '🚗', '💍', '🆘', '📚', '💪']

const getDaysRemaining = (deadline) => {
  if (!deadline) return null
  const diff = new Date(deadline) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const DeadlineBadge = ({ deadline }) => {
  const days = getDaysRemaining(deadline)
  if (days === null) return null
  let cls = 'bg-blue-50 text-blue-600'
  if (days < 0)  cls = 'bg-red-50 text-red-600'
  if (days < 30) cls = 'bg-orange-50 text-orange-600'
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>
      {days < 0 ? '⚠️ Overdue' : days === 0 ? '🔥 Today!' : `📅 ${days}d left`}
    </span>
  )
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useUser()
  const [goals, setGoals]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Create form
  const [name, setName]                 = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [emoji, setEmoji]               = useState('🎯')
  const [deadline, setDeadline]         = useState('')
  const [saving, setSaving]             = useState(false)
  const [message, setMessage]           = useState('')

  // Add money
  const [addingTo, setAddingTo]     = useState(null)
  const [addAmount, setAddAmount]   = useState('')

  // Withdraw money
  const [withdrawingFrom, setWithdrawingFrom] = useState(null)
  const [withdrawAmount, setWithdrawAmount]   = useState('')

  useEffect(() => { if (user) fetchGoals() }, [user])

  const fetchGoals = async () => {
    setLoading(true)
    const { data } = await supabase.from('goals').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!name || !targetAmount) { setMessage('Please fill in all fields.'); return }
    setSaving(true)
    const { error } = await supabase.from('goals').insert({
      user_id: user.id, name, target_amount: parseFloat(targetAmount),
      saved_amount: 0, emoji, deadline: deadline || null,
    })
    if (error) setMessage(error.message)
    else { setName(''); setTargetAmount(''); setEmoji('🎯'); setDeadline(''); setShowForm(false); fetchGoals() }
    setSaving(false)
  }

  const handleAddMoney = async (goal) => {
    const val = parseFloat(addAmount)
    if (!val || val <= 0) return
    await supabase.from('goals').update({ saved_amount: goal.saved_amount + val }).eq('id', goal.id)
    setAddingTo(null); setAddAmount(''); fetchGoals()
  }

  const handleWithdraw = async (goal) => {
    const val = parseFloat(withdrawAmount)
    if (!val || val <= 0) return
    const newSaved = Math.max(0, goal.saved_amount - val)
    await supabase.from('goals').update({ saved_amount: newSaved }).eq('id', goal.id)
    setWithdrawingFrom(null); setWithdrawAmount(''); fetchGoals()
  }

  const handleDelete = async (id) => {
    await supabase.from('goals').delete().eq('id', id)
    fetchGoals()
  }

  if (authLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-4"><SkeletonCard /><SkeletonCard /></div>
  )
  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6 fade-in">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Savings Goals</h2>
          <p className="text-slate-500 text-sm mt-1">Save toward the things that matter</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Create a Goal</h3>
          {/* Emoji */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Pick an emoji</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-100 hover:bg-slate-200'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Goal Name</label>
              <input type="text" placeholder="e.g. Trip to Goa"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Target Amount (₹)</label>
              <input type="number" placeholder="e.g. 50000"
                value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Target Date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
          </div>
          {message && <p className="text-red-500 text-sm">{message}</p>}
          <button onClick={handleCreate} disabled={saving}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Goal'}
          </button>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">🎯</p>
          <p className="text-slate-700 font-semibold">No goals yet</p>
          <p className="text-slate-400 text-sm mt-1">Hit "+ New Goal" to start saving toward something meaningful.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
            const done = pct === 100
            const remaining = goal.target_amount - goal.saved_amount

            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                        <DeadlineBadge deadline={goal.deadline} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {done ? '✅ Goal reached!' : `₹${remaining.toLocaleString('en-IN')} remaining`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="text-slate-300 hover:text-red-400 transition-colors text-sm">✕</button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Circle */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={done ? '#22c55e' : '#6366f1'} strokeWidth="3"
                        strokeDasharray={`${pct} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="flex-1">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>₹{goal.saved_amount.toLocaleString('en-IN')} saved</span>
                      <span>₹{goal.target_amount.toLocaleString('en-IN')} target</span>
                    </div>
                  </div>
                </div>

                {/* Add / Withdraw */}
                {!done && (
                  <>
                    {/* Inline add input */}
                    {addingTo === goal.id && (
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Amount to add (₹)" value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <button onClick={() => handleAddMoney(goal)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-all">Add</button>
                        <button onClick={() => { setAddingTo(null); setAddAmount('') }}
                          className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm hover:bg-slate-200 transition-all">Cancel</button>
                      </div>
                    )}
                    {/* Inline withdraw input */}
                    {withdrawingFrom === goal.id && (
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Amount to withdraw (₹)" value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        <button onClick={() => handleWithdraw(goal)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-orange-600 transition-all">Withdraw</button>
                        <button onClick={() => { setWithdrawingFrom(null); setWithdrawAmount('') }}
                          className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm hover:bg-slate-200 transition-all">Cancel</button>
                      </div>
                    )}
                    {/* Buttons */}
                    {addingTo !== goal.id && withdrawingFrom !== goal.id && (
                      <div className="flex gap-2">
                        <button onClick={() => setAddingTo(goal.id)}
                          className="flex-1 border border-indigo-200 text-indigo-600 py-2 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-all">
                          + Add Money
                        </button>
                        {goal.saved_amount > 0 && (
                          <button onClick={() => setWithdrawingFrom(goal.id)}
                            className="flex-1 border border-orange-200 text-orange-500 py-2 rounded-xl text-sm font-medium hover:bg-orange-50 transition-all">
                            − Withdraw
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
