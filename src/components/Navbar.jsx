export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">WealthWise</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          onClick={onLogout}
          className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
