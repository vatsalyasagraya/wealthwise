import './globals.css'
import { Inter } from 'next/font/google'
import NavbarWrapper from '@/components/NavbarWrapper'

// next/font/google self-hosts the font — no external Google request at runtime
// This is faster and more private than a CSS @import
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata = {
  title: 'WealthWise — Smart Wealth Building',
  description: 'Track investments, savings goals, and portfolio rebalancing in one place.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-slate-50 min-h-screen text-slate-900">
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  )
}
