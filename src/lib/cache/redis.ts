// ===== src/lib/cache/redis.ts =====
interface CacheClient {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  invalidatePattern(pattern: string): Promise<void>
}

class InMemoryCache implements CacheClient {
  private cache = new Map<string, { value: any; expires?: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value as T
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl * 1000 : undefined
    this.cache.set(key, { value, expires })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key))
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    entries.forEach(([key, item]) => {
      if (item.expires && now > item.expires) {
        this.cache.delete(key)
      }
    })
  }
}

// For development, use in-memory cache
// In production, this would connect to Redis
const cacheClient = new InMemoryCache()

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (cacheClient instanceof InMemoryCache) {
      cacheClient.cleanup()
    }
  }, 5 * 60 * 1000)
}

export const cache = cacheClient