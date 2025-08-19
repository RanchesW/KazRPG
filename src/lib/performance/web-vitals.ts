// ===== src/lib/performance/web-vitals.ts =====
'use client'

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

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
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_id: metric.id,
          metric_rating: metric.rating,
        }
      })
    }
  }

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id
    })
  }
}

export function reportWebVitals() {
  try {
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  } catch (error) {
    console.warn('Failed to initialize web vitals:', error)
  }
}
