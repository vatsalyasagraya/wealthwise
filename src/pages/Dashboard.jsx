import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const TYPE_COLORS = {
  'Stocks': 'bg-indigo-500',
  'Mutual Funds': 'bg-purple-500',
  'ETF': 'bg-green-500',
  'Gold': 'bg-yellow-500',
}

const TYPE_CARD_COLORS = {
  'Stocks': 'bg-indigo-100 text-indigo-700',
  'Mutual Funds': 'bg-purple-100 text-purple-700',
  'ETF': 'bg-green-100 text-green-700',
  'Gold': 'bg-yellow-100 text-yellow-700',
}

// Dummy goals — we'll replace this when we build the goals feature
const dummyGoals = [
  { name: '✈️ Trip to Goa', target: 20000, saved: 12000 },
  { name: '💻 New Laptop', target: 80000, saved: 35000 },
  { name: '🆘 Emergency Fund', target: 50000, saved: 50000 },
]

export default function Dashboard({ user }) {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchInvestments()
  }, [user]) // re-runs whenever user changes

  const fetchInvestments = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
    } else {
      setInvestments(data)
    }

    setLoading(false)
  }

  // Calculate total net worth
  const netWorth = investments.reduce((sum, inv) => sum + inv.amount, 0)

  // Group investments by type and sum their amounts
  // Result: { Stocks: 45000, Gold: 15000, ... }
  const byType = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.amount
    return acc
  }, {})

  // Convert to array for rendering
  // Result: [{ name: 'Stocks', value: 45000 }, ...]
  const portfolio = Object.entries(byType).map(([name, value]) => ({ name, value }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Hey there 👋</h2>
        <p className="text-gray-500 mt-1">Here's your financial snapshot for today.</p>
      </div>

      {/* Net Worth Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <p className="text-indigo-200 text-sm font-medium">Total Net Worth</p>
        {loading ? (
          <p className="text-indigo-200 mt-2">Calculating...</p>
        ) : (
          <h2 className="text-4xl font-bold mt-1">₹{netWorth.toLocaleString('en-IN')}</h2>
        )}
        <p className="text-indigo-200 text-sm mt-2">{investments.length} investments tracked</p>
      </div>

      {/* Portfolio Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📊 Portfolio Breakdown</h3>
          <button
            onClick={() => navigate('/portfolio')}
            className="text-sm text-indigo-500 hover:underline"
          >
            Manage →
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
        ) : investments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No investments yet.</p>
            <button
              onClick={() => navigate('/portfolio')}
              className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-all"
            >
              + Add your first investment
            </button>
          </div>
        ) : (
          <>
            {/* Allocation Bar */}
            <div className="flex rounded-full overflow-hidden h-4 mb-6">
              {portfolio.map((item) => (
                <div
                  key={item.name}
                  className={TYPE_COLORS[item.name] || 'bg-gray-400'}
                  style={{ width: `${(item.value / netWorth) * 100}%` }}
                />
              ))}
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[item.name] || 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">₹{item.value.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400">{((item.value / netWorth) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Savings Goals — still dummy, will connect later */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Savings Goals</h3>
        <div className="space-y-5">
          {dummyGoals.map((goal) => {
            const percent = Math.min((goal.saved / goal.target) * 100, 100)
            const isComplete = percent === 100
            return (
              <div key={goal.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                  <span className="text-xs text-gray-400">
                    ₹{goal.saved.toLocaleString('en-IN')} / ₹{goal.target.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-right text-gray-400">
                  {isComplete ? '✅ Goal reached!' : `${percent.toFixed(0)}% there`}
                </p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}