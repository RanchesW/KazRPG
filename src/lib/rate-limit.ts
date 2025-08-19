// ===== src/lib/rate-limit.ts =====
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimit {
  private store: RateLimitStore = {}

  async limit(
    identifier: string,
    { limit, window }: { limit: number; window: number }
  ): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const key = identifier
    
    if (!this.store[key] || now >= this.store[key].resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + window
      }
      return {
        success: true,
        remaining: limit - 1,
        resetTime: this.store[key].resetTime
      }
    }

    this.store[key].count++

    return {
      success: this.store[key].count <= limit,
      remaining: Math.max(0, limit - this.store[key].count),
      resetTime: this.store[key].resetTime
    }
  }

  // Cleanup old entries
  cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (now >= this.store[key].resetTime) {
        delete this.store[key]
      }
    })
  }
}

export const rateLimit = new RateLimit()

// Cleanup every 5 minutes
setInterval(() => rateLimit.cleanup(), 5 * 60 * 1000)