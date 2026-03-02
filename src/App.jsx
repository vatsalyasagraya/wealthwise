import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

// Placeholder for now — we'll build this next
function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-indigo-600">🏠 Dashboard coming soon!</h1>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}