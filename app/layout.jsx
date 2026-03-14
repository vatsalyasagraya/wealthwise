import './globals.css'
import { Inter } from 'next/font/google'
import NavbarWrapper from '@/components/NavbarWrapper'
import { ThemeProvider } from '@/components/ThemeProvider'

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
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let isDark = false;
                const savedTheme = localStorage.getItem('ww-theme');
                if (savedTheme === 'dark') {
                  isDark = true;
                } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  isDark = true;
                }
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <NavbarWrapper />
          <main className="lg:ml-[240px]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
