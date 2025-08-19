// ===== src/lib/performance/web-vitals.ts =====
'use client'

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import { structuredLogger } from '@/lib/logger'

interface WebVitalMetric {
  name: string
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

function sendToAnalytics(metric: WebVitalMetric) {
  // Send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_rating: metric.rating
        }
      })
    }

    // Log to our monitoring system
    structuredLogger.info('Web Vital', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      category: 'performance'
    })
  }
}

export function initWebVitals() {
  try {
    getCLS(sendToAnalytics)
    getFID(sendToAnalytics) 
    getFCP(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)
  } catch (error) {
    console.error('Error initializing web vitals:', error)
  }
}
