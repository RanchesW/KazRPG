// ===== src/lib/analytics/google-analytics.ts =====
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export class GoogleAnalytics {
  private static readonly GA_ID = env.GOOGLE_ANALYTICS_ID

  static initialize() {
    if (!this.GA_ID || typeof window === 'undefined') return

    // Load GA script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', this.GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }

  static trackEvent(action: string, category: string, label?: string, value?: number) {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }

  static trackPageView(url: string, title?: string) {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('config', this.GA_ID, {
      page_path: url,
      page_title: title,
    })
  }

  static trackPurchase(transactionId: string, value: number, currency = 'KZT', items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>) {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    })
  }

  static trackGameView(gameId: string, gameTitle: string, gameSystem: string) {
    this.trackEvent('view_item', 'Games', gameTitle, 1)
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'KZT',
        value: 1,
        items: [{
          item_id: gameId,
          item_name: gameTitle,
          item_category: gameSystem,
          quantity: 1
        }]
      })
    }
  }

  static trackSearch(searchTerm: string, resultsCount: number) {
    this.trackEvent('search', 'Search', searchTerm, resultsCount)
  }

  static trackUserSignup(method: string) {
    this.trackEvent('sign_up', 'Auth', method)
  }

  static trackGameBooking(gameId: string, amount: number) {
    this.trackEvent('begin_checkout', 'Booking', gameId, amount)
  }
}