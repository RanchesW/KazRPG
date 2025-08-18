// ===== src/app/layout.tsx =====
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'KazRPG - Найди свою игру в D&D по Казахстану',
  description: 'Платформа для поиска игр D&D, мастеров и игроков в Казахстане. Онлайн и оффлайн игры для всех уровней опыта.',
  keywords: ['D&D', 'Dungeons & Dragons', 'RPG', 'Казахстан', 'настольные игры', 'ролевые игры', 'Алматы', 'Астана'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  )
}