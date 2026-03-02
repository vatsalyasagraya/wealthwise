import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Goals from "./pages/Goals";
import Rebalancer from "./pages/Rebalancer";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Listen for login/logout changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* All protected pages share one Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout user={user} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/portfolio" element={<Portfolio user={user} />} />
        <Route path="/goals" element={<Goals user={user} />} />
        <Route path="/rebalancer" element={<Rebalancer user={user} />} />
      </Route>
    </Routes>
  );
}
