
import './globals.css'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SuperTools - All-in-One Tools',
  description: 'Fast, Free, and Secure online tools.',
}

export default function RootLayout({ children }) {
  return (
    // 👇 Yahan 'suppressHydrationWarning' jodein
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>

        {/* --- NAVBAR --- */}

        <Suspense fallback={<div className="h-16 bg-white/70 backdrop-blur-xl border-b border-indigo-50/50"></div>}>
          <Navbar />
        </Suspense>

        <main className="flex-grow w-full pt-28">
          {children}
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-slate-900 font-bold">⚡ SuperTools</p>
              <p className="text-slate-500 text-sm mt-1">Built for speed & privacy.</p>
            </div>
            <p className="text-slate-400 text-sm">© 2025 SuperTools Inc.</p>
          </div>
        </footer>

      </body>
    </html>
  )
}