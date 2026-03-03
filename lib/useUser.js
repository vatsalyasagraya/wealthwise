// ============================================================
// useUser — Custom Auth Hook
// ============================================================
// This hook replaces the old ProtectedRoute component.
// Any page that needs auth just calls: const { user, loading } = useUser()
//
// What it does:
//   1. Checks if there's an active Supabase session
//   2. If YES → sets the user and lets the page render
//   3. If NO  → redirects to /login automatically
//   4. Listens for auth changes (logout from another tab, session expiry, etc.)
//
// 'use client' is REQUIRED here because this hook uses:
//   - useState (React state)
//   - useEffect (side effects / lifecycle)
//   - useRouter (Next.js client-side navigation)
// All of these only work in Client Components.
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useUser() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if a session already exists when the page loads
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // No session → redirect. Keep loading=true so the skeleton
                // stays visible instead of briefly flashing page content.
                router.replace('/login')
                return
            }
            setUser(session.user) // Logged in → save user
            setLoading(false)
        })

        // Subscribe to auth changes (login, logout, token refresh)
        // This runs whenever the auth state changes, even in other tabs
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!session) {
                    router.replace('/login')
                } else {
                    setUser(session.user)
                }
            }
        )

        // Cleanup: unsubscribe when component unmounts
        return () => subscription.unsubscribe()
    }, [router])

    return { user, loading }
}
