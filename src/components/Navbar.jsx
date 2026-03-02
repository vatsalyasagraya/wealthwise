import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation(); // tells us which page we're on

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Helper to highlight the active page link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-bold text-indigo-600 cursor-pointer"
      >
        💰 WealthWise
      </h1>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/dashboard")}
          className={`text-sm font-medium transition-all ${
            isActive("/dashboard")
              ? "text-indigo-600"
              : "text-gray-500 hover:text-indigo-500"
          }`}
        >
          🏠 Dashboard
        </button>
        <button
          onClick={() => navigate("/portfolio")}
          className={`text-sm font-medium transition-all ${
            isActive("/portfolio")
              ? "text-indigo-600"
              : "text-gray-500 hover:text-indigo-500"
          }`}
        >
          📊 Portfolio
        </button>
        <button
          onClick={() => navigate("/goals")}
          className={`text-sm font-medium transition-all ${
            isActive("/goals")
              ? "text-indigo-600"
              : "text-gray-500 hover:text-indigo-500"
          }`}
        >
          🎯 Goals
        </button>

        <button
          onClick={() => navigate("/rebalancer")}
          className={`text-sm font-medium transition-all ${
            isActive("/rebalancer")
              ? "text-indigo-600"
              : "text-gray-500 hover:text-indigo-500"
          }`}
        >
          ⚖️ Rebalancer
        </button>
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
