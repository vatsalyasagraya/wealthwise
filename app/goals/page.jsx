'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import Skeleton, { SkeletonCard } from '@/components/Skeleton'
import {
  PlusIcon, TrashIcon, TargetIcon, CalendarIcon, CheckIcon,
  AlertCircleIcon, ClockIcon, PlaneIcon, LaptopIcon, HouseIcon,
  BookIcon, ShieldIcon, CarIcon, GiftIcon, ArrowUpIcon, ArrowDownIcon,
} from '@/components/Icons'

// Category system (replaces emoji picker)
const CATEGORIES = [
  { id: 'target', label: 'General', Icon: TargetIcon },
  { id: 'travel', label: 'Travel', Icon: PlaneIcon },
  { id: 'tech', label: 'Tech', Icon: LaptopIcon },
  { id: 'home', label: 'Home', Icon: HouseIcon },
  { id: 'education', label: 'Education', Icon: BookIcon },
  { id: 'car', label: 'Vehicle', Icon: CarIcon },
  { id: 'emergency', label: 'Emergency', Icon: ShieldIcon },
  { id: 'gift', label: 'Other', Icon: GiftIcon },
]

const getCategoryIcon = (emoji) => {
  // Map old emojis to new categories, fallback to TargetIcon
  const map = {
    '✈️': PlaneIcon, '💻': LaptopIcon, '📱': LaptopIcon, '🏠': HouseIcon,
    '🚗': CarIcon, '📚': BookIcon, '🆘': ShieldIcon, '💪': TargetIcon,
    '💍': GiftIcon, '🎯': TargetIcon,
  }
  return map[emoji] || TargetIcon
}

const getDaysRemaining = (deadline) => {
  if (!deadline) return null
  const diff = new Date(deadline) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const DeadlineBadge = ({ deadline }) => {
  const days = getDaysRemaining(deadline)
  if (days === null) return null
  let cls = 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
  let text = `${days}d left`
  if (days < 0) { cls = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'; text = 'Overdue' }
  else if (days === 0) { cls = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'; text = 'Due today' }
  else if (days < 30) { cls = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${cls}`}>
      <CalendarIcon className="w-3 h-3" />
      {text}
    </span>
  )
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useUser()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [category, setCategory] = useState('target')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [addingTo, setAddingTo] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [withdrawingFrom, setWithdrawingFrom] = useState(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')

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
    // Store category ID in the emoji column for backward compatibility
    const { error } = await supabase.from('goals').insert({
      user_id: user.id, name, target_amount: parseFloat(targetAmount),
      saved_amount: 0, emoji: category, deadline: deadline || null,
    })
    if (error) setMessage(error.message)
    else { setName(''); setTargetAmount(''); setCategory('target'); setDeadline(''); setShowForm(false); fetchGoals() }
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Save toward the things that matter</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">
          {showForm ? 'Cancel' : <><PlusIcon className="w-4 h-4" /> New Goal</>}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Create a Goal</h3>

          {/* Category selector */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all
                    ${category === c.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <c.Icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1.5">Goal Name</label>
              <input type="text" placeholder="e.g. Trip to Goa"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1.5">Target Amount ({'\u20B9'})</label>
              <input type="number" placeholder="e.g. 50000"
                value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
              Target Date <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
            </label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>

          {message && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">{message}</p>}

          <button onClick={handleCreate} disabled={saving}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-12 text-center">
          <TargetIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-semibold">No goals yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Click "New Goal" to start saving toward something meaningful.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
            const done = pct === 100
            const remaining = goal.target_amount - goal.saved_amount
            const GoalIcon = getCategoryIcon(goal.emoji)

            return (
              <div key={goal.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      {done
                        ? <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        : <GoalIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{goal.name}</h3>
                        <DeadlineBadge deadline={goal.deadline} />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {done ? 'Goal reached' : `\u20B9${remaining.toLocaleString('en-IN')} remaining`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={done ? '#22c55e' : '#6366f1'} strokeWidth="3"
                        strokeDasharray={`${pct} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span>{'\u20B9'}{goal.saved_amount.toLocaleString('en-IN')} saved</span>
                      <span>{'\u20B9'}{goal.target_amount.toLocaleString('en-IN')} target</span>
                    </div>
                  </div>
                </div>

                {/* Add / Withdraw */}
                {!done && (
                  <>
                    {addingTo === goal.id && (
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Amount (INR)" value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={() => handleAddMoney(goal)}
                          className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">Add</button>
                        <button onClick={() => { setAddingTo(null); setAddAmount('') }}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                      </div>
                    )}
                    {withdrawingFrom === goal.id && (
                      <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Amount (INR)" value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        <button onClick={() => handleWithdraw(goal)}
                          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-all">Withdraw</button>
                        <button onClick={() => { setWithdrawingFrom(null); setWithdrawAmount('') }}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                      </div>
                    )}
                    {addingTo !== goal.id && withdrawingFrom !== goal.id && (
                      <div className="flex gap-2">
                        <button onClick={() => setAddingTo(goal.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <ArrowUpIcon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          Add Money
                        </button>
                        {goal.saved_amount > 0 && (
                          <button onClick={() => setWithdrawingFrom(goal.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <ArrowDownIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            Withdraw
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
