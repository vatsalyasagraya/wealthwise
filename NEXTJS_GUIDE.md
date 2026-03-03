# Next.js — Complete Guide (WealthWise Edition)

> This guide teaches you every Next.js concept used in this project,
> using WealthWise's own code as examples. Read it top to bottom once —
> it builds on itself.

---

## 1. What Is Next.js and Why Did We Switch?

**Vite** is a tool that builds a "Single Page App" (SPA). The browser downloads your app once as a bundle of JavaScript, and React takes over — rendering everything client-side in the browser.

**Next.js** is a full-stack React framework. It gives you:
- **Server-side rendering** — pages can be rendered on the server before being sent to the browser (faster load, better SEO)
- **Built-in routing** — no need for `react-router-dom`
- **API Routes** — write backend code (like Node.js functions) inside the same project
- **Performance optimizations** — image compression, code splitting, prefetching

For us, the biggest win is **API Routes** — we can fetch live stock prices, handle payments, and process webhooks all *inside* the WealthWise project, without a separate backend server.

---

## 2. File-Based Routing — The Biggest Mindset Shift

In Vite+React, you define routes in a file (like `App.jsx`):
```jsx
// OLD WAY (Vite + react-router-dom)
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/goals" element={<Goals />} />
```

In Next.js, **the folder structure IS your router.** No config needed.

```
app/
├── page.jsx           → renders at "/"
├── login/
│   └── page.jsx       → renders at "/login"
├── dashboard/
│   └── page.jsx       → renders at "/dashboard"
└── goals/
    └── page.jsx       → renders at "/goals"
```

### How to add a new page
1. Create a new folder in `app/`
2. Create a `page.jsx` inside it
3. Export a default React component

That's it. No imports, no config, no `<Route>` declarations.

```jsx
// app/settings/page.jsx → automatically available at /settings
export default function SettingsPage() {
  return <div>Settings!</div>
}
```

### Dynamic Routes
What if you need `/investments/[id]`? Use square brackets:
```
app/investments/[id]/page.jsx  → matches /investments/42, /investments/abc, etc.
```
```jsx
// app/investments/[id]/page.jsx
export default function InvestmentDetailPage({ params }) {
  return <div>Investment ID: {params.id}</div>
}
```

---

## 3. Special Files in the `app/` Directory

Next.js recognizes these specific filenames and gives them powers:

| File | Purpose |
|---|---|
| `page.jsx` | The actual content of a route — **required** to make a route exist |
| `layout.jsx` | Wraps all pages in the same folder (and subfolders) |
| `loading.jsx` | Shown automatically while a page is loading |
| `error.jsx` | Shown automatically if a page throws an error |
| `not-found.jsx` | Custom 404 page |

### layout.jsx in depth

Our `app/layout.jsx` is the ROOT layout — it wraps every single page.

```jsx
// app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>  {/* ← your page.jsx goes here */}
      </body>
    </html>
  )
}
```

`children` is automatically the contents of whatever `page.jsx` is currently active. You never pass it manually — Next.js handles it.

You can also have **nested layouts**:
```
app/
├── layout.jsx         ← wraps EVERYTHING
├── dashboard/
│   ├── layout.jsx     ← wraps only dashboard sub-pages
│   └── page.jsx
```

---

## 4. Server Components vs Client Components

This is the most important Next.js concept to understand.

### Server Components (default)
Every component in Next.js is a **Server Component by default**.

- ✅ Rendered on the server, HTML sent to browser
- ✅ Faster initial page load
- ✅ Can directly access databases, files, environment variables
- ❌ **Cannot** use `useState`, `useEffect`, `useRef`
- ❌ **Cannot** use `onClick`, `onChange` event handlers
- ❌ **Cannot** use browser APIs (`window`, `document`, etc.)

### Client Components (opt-in)
Add `'use client'` at the top of a file to make it a Client Component.

```jsx
'use client'  // ← this ONE line changes everything below it

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)  // works! ✅
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

- ✅ Can use all React hooks
- ✅ Can handle browser events
- ✅ Runs in the browser
- ❌ Can't directly access server resources

### In WealthWise
All our pages have `'use client'` because they:
- Use `useState` (loading states, form fields, etc.)
- Use `useEffect` (fetching from Supabase on mount)
- Have `onClick` buttons

Our `app/layout.jsx` does NOT have `'use client'` — it's a Server Component because it doesn't need any hooks. It just renders HTML structure and imports `NavbarWrapper`.

### The "Client Boundary" rule
Once you add `'use client'` to a component, all its imported child components also become client-side. The directive "propagates down" but never up.

---

## 5. Navigation — useRouter and usePathname

React Router had `useNavigate` and `useLocation`. Next.js has equivalents.

> ⚠️ **Important**: Always import from `'next/navigation'` (NOT `'next/router'` — that's the OLD Pages Router)

### useRouter
```jsx
'use client'
import { useRouter } from 'next/navigation'

export default function MyComponent() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/dashboard')}>
      Go to Dashboard
    </button>
  )
}
```

| Method | Effect |
|---|---|
| `router.push('/path')` | Navigate to path, adds to history |
| `router.replace('/path')` | Navigate, replaces current history entry (no "back" button) |
| `router.back()` | Go back in browser history |
| `router.refresh()` | Re-fetch data for current page |

### usePathname
```jsx
'use client'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()  // e.g. "/dashboard"

  return (
    <nav>
      <a style={{ fontWeight: pathname === '/dashboard' ? 'bold' : 'normal' }}>
        Dashboard
      </a>
    </nav>
  )
}
```

### redirect() in Server Components
In Server Components (no `'use client'`), you can redirect synchronously:
```jsx
// app/page.jsx - Server Component
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')  // immediately redirects, no JS needed
}
```

---

## 6. The `@/` Import Alias

You'll see imports like this throughout WealthWise:
```jsx
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import Navbar from '@/components/Navbar'
```

The `@/` is an **alias** for the **project root**. It's configured in `jsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Without it, deeply nested files would need ugly relative paths:
```jsx
// ❌ Without alias (fragile, changes when you move files)
import { supabase } from '../../../lib/supabase'

// ✅ With @/ alias (always works from any depth)
import { supabase } from '@/lib/supabase'
```

---

## 7. Environment Variables

| Framework | Prefix for browser access |
|---|---|
| Vite | `VITE_` |
| Next.js | `NEXT_PUBLIC_` |

**Server-only** (no prefix) — secret keys, DB passwords. These are NEVER sent to the browser:
```
# .env.local
DB_PASSWORD=supersecret123          # only available server-side
STRIPE_SECRET_KEY=sk_live_...       # only available server-side
```

**Client-accessible** (`NEXT_PUBLIC_` prefix) — safe to expose in browser:
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://...      # available in browser ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=...         # available in browser ✅
```

Access them in code:
```js
// In any file (server or client)
process.env.NEXT_PUBLIC_SUPABASE_URL   // works everywhere
process.env.DB_PASSWORD                // only works on server
```

> ⚠️ Use `.env.local` (not `.env`) for secrets — `.env.local` is gitignored by Next.js automatically.

---

## 8. API Routes — Your Built-In Backend

This is the killer feature for our roadmap. Instead of a separate Node.js server, create files in `app/api/`.

```
app/api/
└── prices/
    └── route.js   → handles GET/POST at /api/prices
```

```js
// app/api/prices/route.js
// This runs on the SERVER — never seen by users
// You can put secret API keys here safely!

export async function GET(request) {
  // Fetch live NSE price data from an external API
  const res = await fetch('https://some-stock-api.com/nse', {
    headers: { 'Authorization': `Bearer ${process.env.STOCK_API_KEY}` }
  })
  const data = await res.json()

  return Response.json(data)
}

export async function POST(request) {
  const body = await request.json()
  // Handle POST data here
  return Response.json({ success: true })
}
```

Then call it from your client components:
```jsx
// In any page component
const res = await fetch('/api/prices')
const data = await res.json()
```

**For WealthWise, we'll use API routes for:**
- 📈 Fetching live stock/MF prices (without exposing API keys)
- 💳 Razorpay payment webhooks
- 📄 PDF report generation

---

## 9. Metadata (SEO)

Instead of putting `<title>` in `index.html`, you export a `metadata` object:

```jsx
// In any page.jsx or layout.jsx (Server Components only!)
export const metadata = {
  title: 'Dashboard — WealthWise',
  description: 'Track your investments and net worth',
  openGraph: {
    title: 'WealthWise',
    description: 'Track your wealth',
    images: ['/og-image.png'],
  },
}

export default function DashboardPage() {
  return <div>...</div>
}
```

Next.js automatically injects these into `<head>`. Each page can have its own title.

---

## 10. The `useUser` Hook — How Auth Works

We replaced `ProtectedRoute` with a custom hook. Here's how it works:

```jsx
// lib/useUser.js
export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')  // not logged in → redirect
      else setUser(session.user)              // logged in → save user
      setLoading(false)
    })

    // Also listen for logout (e.g., from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace('/login')
        else setUser(session.user)
      }
    )

    return () => subscription.unsubscribe()  // cleanup
  }, [router])

  return { user, loading }
}
```

Every protected page uses it like this:
```jsx
export default function DashboardPage() {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return null  // redirect is already happening

  return <div>Hello {user.email}!</div>
}
```

---

## 11. Project Structure Summary

```
wealthwise/
├── app/                    ← All routes live here (Next.js App Router)
│   ├── layout.jsx          ← Root layout (wraps everything)
│   ├── page.jsx            ← "/" → redirects to /dashboard
│   ├── globals.css         ← Global styles (Tailwind import)
│   ├── login/page.jsx      ← "/login"
│   ├── dashboard/page.jsx  ← "/dashboard"
│   ├── portfolio/page.jsx  ← "/portfolio"
│   ├── goals/page.jsx      ← "/goals"
│   ├── rebalancer/page.jsx ← "/rebalancer"
│   └── api/                ← Backend API routes (future)
│       └── prices/route.js ← "/api/prices"
│
├── components/             ← Reusable React components
│   ├── Navbar.jsx
│   └── NavbarWrapper.jsx   ← Shows/hides Navbar based on route
│
├── lib/                    ← Utility/helper files
│   ├── supabase.js         ← Supabase client
│   └── useUser.js          ← Auth hook
│
├── public/                 ← Static files (images, icons)
│
├── next.config.mjs         ← Next.js config
├── postcss.config.mjs      ← Tailwind v4 integration
├── jsconfig.json           ← "@/" path alias
└── .env.local              ← Secrets (gitignored)
```

---

## 12. Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Forgetting `'use client'` on a component with hooks | Add `'use client'` as the very first line |
| Importing from `'next/router'` | Use `'next/navigation'` (App Router) |
| Using `VITE_` prefix | Use `NEXT_PUBLIC_` prefix |
| Putting secrets in `NEXT_PUBLIC_` vars | Server-only vars have NO prefix |
| Creating a page without a `page.jsx` file | Every route needs its own `page.jsx` |
| Using `<a href="...">` for internal links | Use `router.push()` or Next.js `<Link>` |

---

## 13. What's Next (Pun Intended)

For the WealthWise roadmap, here's what to learn as we build each feature:

| Feature | New Concept |
|---|---|
| Live stock prices | API Routes + server-side fetch |
| Razorpay payments | API Routes + webhooks |
| Email digests | API Routes + cron jobs (Vercel Cron) |
| Premium features | Middleware (protect routes at edge) |
| Tax reports | API Routes + PDF generation |
| Faster initial loads | Server Components with async data |
