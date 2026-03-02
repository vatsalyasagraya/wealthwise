import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Dummy data for now — we'll replace with real Supabase data later
const dummyPortfolio = [
  { name: 'Stocks', value: 45000, color: 'bg-indigo-500' },
  { name: 'Mutual Funds', value: 30000, color: 'bg-purple-500' },
  { name: 'Gold', value: 15000, color: 'bg-yellow-500' },
  { name: 'ETFs', value: 10000, color: 'bg-green-500' },
]

const dummyGoals = [
  { name: '✈️ Trip to Goa', target: 20000, saved: 12000 },
  { name: '💻 New Laptop', target: 80000, saved: 35000 },
  { name: '🆘 Emergency Fund', target: 50000, saved: 50000 },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get the currently logged in user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Calculate total net worth from portfolio
  const netWorth = dummyPortfolio.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hey there 👋
          </h2>
          <p className="text-gray-500 mt-1">Here's your financial snapshot for today.</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-indigo-200 text-sm font-medium">Total Net Worth</p>
          <h2 className="text-4xl font-bold mt-1">
            ₹{netWorth.toLocaleString('en-IN')}
          </h2>
          <p className="text-indigo-200 text-sm mt-2">↑ 12.4% this year</p>
        </div>

        {/* Portfolio Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Portfolio Breakdown</h3>
          
          {/* Total bar */}
          <div className="flex rounded-full overflow-hidden h-4 mb-6">
            {dummyPortfolio.map((item) => (
              <div
                key={item.name}
                className={`${item.color}`}
                style={{ width: `${(item.value / netWorth) * 100}%` }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4">
            {dummyPortfolio.map((item) => (
              <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">₹{item.value.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">{((item.value / netWorth) * 100).toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals */}
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
                  {/* Progress bar */}
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
    </div>
  )
}