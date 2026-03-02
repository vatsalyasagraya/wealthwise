import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

export default function Layout({ user }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      {/* Outlet renders whichever child page is active */}
      <Outlet />
    </div>
  )
}