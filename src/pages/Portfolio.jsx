import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const INVESTMENT_TYPES = ["Stocks", "Mutual Funds", "ETF", "Gold"];

const TYPE_COLORS = {
  Stocks: "bg-indigo-100 text-indigo-700",
  "Mutual Funds": "bg-purple-100 text-purple-700",
  ETF: "bg-green-100 text-green-700",
  Gold: "bg-yellow-100 text-yellow-700",
};

const TYPE_CHART_COLORS = {
  Stocks: "#6366f1",
  "Mutual Funds": "#a855f7",
  ETF: "#22c55e",
  Gold: "#eab308",
};

export default function Portfolio({ user }) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("Stocks");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user ONCE — then fetch their investments
  useEffect(() => {
    fetchInvestments(user.id);
  }, []);

  // Now accepts userId as a parameter instead of fetching user again
  const fetchInvestments = async (userId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setInvestments(data);
    }

    setLoading(false);
  };

  const handleAddInvestment = async () => {
    if (!name || !amount) {
      setMessage("Please fill in all fields.");
      return;
    }

    setSaving(true);
    setMessage("");

    // Reuse user from state — no extra getUser() call!
    const { error } = await supabase.from("investments").insert({
      user_id: user.id,
      name,
      type,
      amount: parseFloat(amount),
    });

    if (error) {
      setMessage(error.message);
    } else {
      setName("");
      setAmount("");
      setType("Stocks");
      setShowForm(false);
      fetchInvestments(user.id); // reuse user.id from state
    }

    setSaving(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("investments").delete().eq("id", id);
    if (!error) fetchInvestments(user.id); // reuse user.id from state
  };

  const total = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Portfolio Tracker
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Track all your investments in one place
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            {showForm ? "Cancel" : "+ Add Investment"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">New Investment</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Investment Name
              </label>
              <input
                type="text"
                placeholder="e.g. Reliance Industries, Nifty 50 Index Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              >
                {INVESTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Value (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>
            {message && <p className="text-red-500 text-sm">{message}</p>}
            <button
              onClick={handleAddInvestment}
              disabled={saving}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Investment"}
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-indigo-200 text-sm">Total Portfolio Value</p>
          <h2 className="text-3xl font-bold mt-1">
            ₹{total.toLocaleString("en-IN")}
          </h2>
          <p className="text-indigo-200 text-sm mt-1">
            {investments.length} investments tracked
          </p>
        </div>
        {/* Pie Chart — only show if there are investments */}
        {!loading && investments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Asset Allocation
            </h3>

            {/* Group investments by type for the chart */}
            {(() => {
              const byType = investments.reduce((acc, inv) => {
                acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
                return acc;
              }, {});

              const chartData = Object.entries(byType).map(([name, value]) => ({
                name,
                value,
              }));

              return (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={TYPE_CHART_COLORS[entry.name] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}

            {/* Center text showing total */}
            <p className="text-center text-sm text-gray-400 mt-2">
              Total: ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Your Investments</h3>
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : investments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No investments yet. Add your first one! 👆
            </p>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${TYPE_COLORS[inv.type]}`}
                    >
                      {inv.type}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {inv.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-800">
                      ₹{inv.amount.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
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
    </div>
  );
}
