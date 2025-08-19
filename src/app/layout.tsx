import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // Better font loading performance
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'KazRPG - Найди свою игру в D&D по Казахстану',
    template: '%s | KazRPG'
  },
  description: 'Платформа для поиска игр D&D, мастеров и игроков в Казахстане. Онлайн и оффлайн игры для всех уровней опыта.',
  keywords: ['D&D', 'Dungeons & Dragons', 'RPG', 'Казахстан', 'настольные игры', 'ролевые игры', 'Алматы', 'Астана'],
  authors: [{ name: 'KazRPG Team' }],
  creator: 'KazRPG',
  publisher: 'KazRPG',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://kazrpg.kz',
    siteName: 'KazRPG',
    title: 'KazRPG - Найди свою игру в D&D по Казахстану',
    description: 'Платформа №1 для поиска игр D&D и RPG в Казахстане',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KazRPG - Платформа для поиска игр D&D',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kazrpg',
    creator: '@kazrpg',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for faster loading */}
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#7c3aed" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            <WebVitalsReporter />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}