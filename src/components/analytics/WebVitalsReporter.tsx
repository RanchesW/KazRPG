// ===== src/components/analytics/WebVitalsReporter.tsx =====
'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/performance/web-vitals'
import { usePreloadCriticalRoutes, addResourceHints } from '@/lib/performance/preloading'

export function WebVitalsReporter() {
  usePreloadCriticalRoutes()

  useEffect(() => {
    // Initialize web vitals tracking
    reportWebVitals()
    
    // Add resource hints for better performance
    addResourceHints()
  }, [])

  return null
}