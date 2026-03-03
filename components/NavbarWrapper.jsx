// ============================================================
// components/NavbarWrapper.jsx
// ============================================================
//
// 🧠 WHY THIS FILE EXISTS
// -----------------------
// Our root layout (app/layout.jsx) is a Server Component.
// But to know "what page are we on?", we need usePathname()
// which is a CLIENT hook. Server Components can't use hooks.
//
// Solution: Extract the "should I show Navbar?" logic into this
// small Client Component. The layout stays a Server Component
// (faster), and only THIS small wrapper is a Client Component.
//
// This is a common Next.js pattern: keep layouts as Server Components,
// push client logic into small leaf components.
//
// 🧠 NEXT.JS CONCEPT: usePathname
// --------------------------------
// Replaces React Router's useLocation().pathname
// Returns the current URL path, e.g. "/dashboard", "/goals"
//
// 🧠 NEXT.JS CONCEPT: 'use client'
// ----------------------------------
// This directive tells Next.js: "This file runs in the browser".
// It's required for any component using:
//   - useState, useEffect, useRef (React hooks)
//   - useRouter, usePathname (Next.js navigation hooks)
//   - onClick, onChange (event handlers)
//   - browser APIs (window, document, etc.)
'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Keep user in sync on auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Don't show Navbar on the login page
  if (pathname === '/login') return null

  return <Navbar user={user} />
}
