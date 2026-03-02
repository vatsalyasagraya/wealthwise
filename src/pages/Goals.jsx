import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const EMOJI_OPTIONS = [
  "🎯",
  "✈️",
  "💻",
  "📱",
  "🏠",
  "🚗",
  "💍",
  "🆘",
  "📚",
  "💪",
];

export default function Goals({ user }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New goal form
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Add money state — tracks which goal is being topped up
  const [addingTo, setAddingTo] = useState(null);
  const [addAmount, setAddAmount] = useState("");

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setGoals(data);

    setLoading(false);
  };

  const handleCreateGoal = async () => {
    if (!name || !targetAmount) {
      setMessage("Please fill in all fields.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name,
      target_amount: parseFloat(targetAmount),
      saved_amount: 0,
      emoji,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setName("");
      setTargetAmount("");
      setEmoji("🎯");
      setShowForm(false);
      fetchGoals();
    }

    setSaving(false);
  };

  const handleAddMoney = async (goal) => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;

    const newSaved = goal.saved_amount + parseFloat(addAmount);

    const { error } = await supabase
      .from("goals")
      .update({ saved_amount: newSaved })
      .eq("id", goal.id);

    if (!error) {
      setAddingTo(null);
      setAddAmount("");
      fetchGoals();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) fetchGoals();
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🎯 Savings Goals</h2>
          <p className="text-gray-500 text-sm mt-1">
            Save toward the things that matter
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          {showForm ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {/* Create Goal Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Create a New Goal</h3>

          {/* Emoji Picker */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Pick an emoji
            </label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-2 rounded-lg transition-all ${
                    emoji === e
                      ? "bg-indigo-100 ring-2 ring-indigo-400"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Goal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Trip to Goa, New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Target Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {message && <p className="text-red-500 text-sm">{message}</p>}

          <button
            onClick={handleCreateGoal}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Goal"}
          </button>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading...</p>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 text-sm">
            No goals yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const percent = Math.min(
              (goal.saved_amount / goal.target_amount) * 100,
              100,
            );
            const isComplete = percent === 100;
            const remaining = goal.target_amount - goal.saved_amount;

            return (
              <div key={goal.id} className="bg-white rounded-2xl shadow-sm p-6">
                {/* Goal Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {goal.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {isComplete
                          ? "✅ Goal reached!"
                          : `₹${remaining.toLocaleString("en-IN")} remaining`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Replace the old progress bar section with this */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Big percentage circle */}
                  <div className={`relative w-16 h-16 flex-shrink-0`}>
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke={isComplete ? "#22c55e" : "#6366f1"}
                        strokeWidth="3"
                        strokeDasharray={`${percent} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress details */}
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${isComplete ? "bg-green-500" : "bg-indigo-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>
                        ₹{goal.saved_amount.toLocaleString("en-IN")} saved
                      </span>
                      <span>
                        ₹{goal.target_amount.toLocaleString("en-IN")} target
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="flex justify-between text-xs text-gray-400 mb-4">
                  <span>
                    ₹{goal.saved_amount.toLocaleString("en-IN")} saved
                  </span>
                  <span>
                    {percent.toFixed(0)}% of ₹
                    {goal.target_amount.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Add Money Section */}
                {!isComplete &&
                  (addingTo === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount to add (₹)"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => handleAddMoney(goal)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-all"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingTo(null);
                          setAddAmount("");
                        }}
                        className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTo(goal.id)}
                      className="w-full border border-indigo-200 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all"
                    >
                      + Add Money
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
