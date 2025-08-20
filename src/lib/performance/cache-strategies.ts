// ===== src/lib/performance/cache-strategies.ts =====
import { cache } from '@/lib/cache/redis'
import { prisma } from '@/lib/prisma'
import { structuredLogger } from '@/lib/logger'
import { unstable_cache } from 'next/cache'

interface CacheConfig {
  ttl: number
  tags: string[]
  revalidate?: number
}

class CacheStrategy {
  // Game-related caching
  static async getPopularGames(limit = 10): Promise<any[]> {
    const cacheKey = `popular-games:${limit}`
    
    return this.withCache(
      cacheKey,
      async () => {
        return prisma.game.findMany({
          where: {
            isActive: true,
            startDate: { gte: new Date() }
          },
          include: {
            gm: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                rating: true,
                isVerified: true,
              }
            },
            _count: {
              select: {
                bookings: { where: { status: 'CONFIRMED' } },
                reviews: true,
              }
            }
          },
          orderBy: [
            { currentPlayers: 'desc' },
            { createdAt: 'desc' }
          ],
          take: limit,
        })
      },
      { ttl: 300, tags: ['games', 'popular'] } // 5 minutes
    )
  }

  static async getGamesByCity(city: string): Promise<any[]> {
    const cacheKey = `games-by-city:${city}`
    
    return this.withCache(
      cacheKey,
      async () => {
        return prisma.game.findMany({
          where: {
            city,
            isActive: true,
            startDate: { gte: new Date() }
          },
          include: {
            gm: { select: { username: true, rating: true, isVerified: true } },
            _count: { select: { bookings: true } }
          },
          orderBy: { startDate: 'asc' },
          take: 20,
        })
      },
      { ttl: 600, tags: ['games', `city-${city}`] } // 10 minutes
    )
  }

  static async getGMStats(gmId: string): Promise<any> {
    const cacheKey = `gm-stats:${gmId}`
    
    return this.withCache(
      cacheKey,
      async () => {
        const [gameCount, avgRating, totalPlayers, completedGames] = await Promise.all([
          prisma.game.count({ where: { gmId, isActive: true } }),
          prisma.review.aggregate({
            where: { targetId: gmId },
            _avg: { rating: true },
            _count: true,
          }),
          prisma.booking.count({
            where: { game: { gmId }, status: 'CONFIRMED' }
          }),
          prisma.game.count({
            where: { gmId, endDate: { lt: new Date() } }
          })
        ])

        return {
          gameCount,
          averageRating: avgRating._avg.rating || 0,
          reviewCount: avgRating._count,
          totalPlayers,
          completedGames,
        }
      },
      { ttl: 1800, tags: ['gm', `gm-${gmId}`] } // 30 minutes
    )
  }

  // Generic cache wrapper with Redis fallback
  private static async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    try {
      // Try Redis first
      const cached = await cache.get<T>(key)
      if (cached) {
        structuredLogger.info('Cache hit', { key, source: 'redis' })
        return cached
      }

      // Fetch fresh data
      const data = await fetcher()
      
      // Store in Redis
      await cache.set(key, data, config.ttl)
      
      structuredLogger.info('Cache miss - data fetched and stored', { key })
      return data
    } catch (error) {
      structuredLogger.error('Cache error, falling back to direct fetch', error as Error, { key })
      return fetcher()
    }
  }

  // Cache invalidation helpers
  static async invalidateGamesCache(): Promise<void> {
    await Promise.all([
      cache.invalidatePattern('popular-games:*'),
      cache.invalidatePattern('games-by-city:*'),
      cache.invalidatePattern('featured-games:*'),
    ])
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      cache.invalidatePattern(`user:${userId}:*`),
      cache.invalidatePattern(`gm-stats:${userId}`),
    ])
  }
}

// Next.js 14 Data Cache with tags
export const getCachedGames = unstable_cache(
  async (filters: any) => {
    const where: any = { isActive: true, startDate: { gte: new Date() } }
    
    if (filters.city) where.city = filters.city
    if (filters.gameSystem) where.gameSystem = filters.gameSystem
    if (filters.isOnline !== undefined) where.isOnline = filters.isOnline
    
    return prisma.game.findMany({
      where,
      include: {
        gm: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rating: true,
            isVerified: true,
          }
        },
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
            reviews: true,
          }
        }
      },
      orderBy: { startDate: 'asc' },
      take: 20,
    })
  },
  ['games'],
  {
    revalidate: 300, // 5 minutes
    tags: ['games']
  }
)

export { CacheStrategy }