// ===== src/lib/performance/preloading.ts =====
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Preload critical routes
export function usePreloadCriticalRoutes() {
  const router = useRouter()

  useEffect(() => {
    // Preload frequently visited routes
    const criticalRoutes = [
      '/games',
      '/auth/signin',
      '/auth/signup',
      '/dashboard',
    ]

    criticalRoutes.forEach(route => {
      router.prefetch(route)
    })
  }, [router])
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof window === 'undefined') return

  // DNS prefetch for external domains
  const dnsPreconnects = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
  ]

  dnsPreconnects.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })

  // Preconnect to same origin for faster requests
  const preconnectLink = document.createElement('link')
  preconnectLink.rel = 'preconnect'
  preconnectLink.href = window.location.origin
  document.head.appendChild(preconnectLink)
}