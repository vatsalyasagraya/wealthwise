// ============================================================
// app/layout.jsx — Root Layout
// ============================================================
//
// 🧠 NEXT.JS CONCEPT: Layouts
// ----------------------------
// In Next.js App Router, layout.jsx is a SPECIAL file.
// It wraps EVERY page inside it automatically.
// You don't render a layout manually — Next.js does it for you.
//
// Think of it like this:
//   layout.jsx        → the "frame" (Navbar, html/body tags, global CSS)
//   dashboard/page.jsx → the content inside the frame
//   goals/page.jsx    → different content, same frame
//
// This means:
//   ✅ Navbar only written once (here), shows on all pages
//   ✅ No need to import Layout in every page
//   ✅ html and body tags live here, not in index.html
//
// 🧠 NEXT.JS CONCEPT: Server vs Client Components
// ------------------------------------------------
// By DEFAULT, all components in Next.js are SERVER COMPONENTS.
// This file has NO 'use client' directive → it's a Server Component.
//
// Server Components:
//   ✅ Faster (rendered on server, no JS sent to browser for them)
//   ✅ Can read files, query databases directly
//   ❌ Cannot use useState, useEffect, onClick, etc.
//
// Client Components (need 'use client' at the top):
//   ✅ Can use hooks, event handlers, browser APIs
//   ❌ Slightly heavier (their JS is shipped to the browser)
//
// Our pages all have 'use client' because they use useState/useEffect.
// This layout file doesn't need hooks, so it stays a Server Component.

import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'

// 🧠 NEXT.JS CONCEPT: Metadata
// ------------------------------
// Instead of putting <title> and <meta> tags in HTML manually,
// Next.js exports a `metadata` object. Next.js automatically
// injects these into the <head> of the page for SEO.
export const metadata = {
  title: 'WealthWise — Smart Wealth Building',
  description: 'Track your investments, savings goals, and portfolio rebalancing in one place.',
}

// RootLayout receives `children` — this is whatever page.jsx is active
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {/*
          NavbarWrapper is a Client Component that:
          1. Listens to the current URL path
          2. Hides itself on the /login page
          3. Shows the Navbar on all other pages
        */}
        <NavbarWrapper />

        {/* `children` is automatically replaced with the matching page.jsx */}
        <main>{children}</main>
      </body>
    </html>
  )
}
