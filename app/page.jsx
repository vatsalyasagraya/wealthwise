// ============================================================
// app/page.jsx — Root Route "/"
// ============================================================
//
// 🧠 NEXT.JS CONCEPT: File-Based Routing
// ----------------------------------------
// In Next.js, the FILE SYSTEM is your router.
// You don't define routes in a config file or with <Route> components.
//
// The rule is simple:
//   app/page.jsx           → renders at "/"
//   app/dashboard/page.jsx → renders at "/dashboard"
//   app/goals/page.jsx     → renders at "/goals"
//
// To add a NEW page, you just:
//   1. Create a new folder inside app/
//   2. Put a page.jsx inside it
//   Done! It's automatically a route. No config needed.
//
// 🧠 NEXT.JS CONCEPT: redirect() in Server Components
// ----------------------------------------------------
// `redirect` from 'next/navigation' works in Server Components.
// It immediately stops rendering and sends the browser to the new URL.
// This replaces React Router's <Navigate to="/dashboard" /> pattern.

import { redirect } from 'next/navigation'

export default function RootPage() {
  // When someone visits "/", immediately redirect to "/dashboard"
  // The useUser hook in Dashboard will handle auth — if not logged in,
  // it will redirect to "/login" automatically.
  redirect('/dashboard')
}
