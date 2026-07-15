import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Evening Check-in',
  description: 'A private daily reflection log',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Evening',
  },
}

export const viewport: Viewport = {
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-stone-950 text-stone-100 antialiased min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <nav className="flex items-center justify-between py-5 border-b border-stone-800/60">
            <a href="/" className="text-stone-400 text-xs tracking-widest uppercase font-medium hover:text-stone-100 transition-colors">
              Evening
            </a>
            <div className="flex gap-6">
              <a href="/log" className="text-stone-400 text-sm hover:text-stone-100 transition-colors">Log</a>
              <a href="/insights" className="text-stone-400 text-sm hover:text-stone-100 transition-colors">Insights</a>
              <a href="/history" className="text-stone-400 text-sm hover:text-stone-100 transition-colors">History</a>
            </div>
          </nav>
          <main className="py-10 animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
