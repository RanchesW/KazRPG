// ===== src/lib/performance/database-optimization.ts =====
import { PrismaClient } from '@prisma/client'
import { performanceMonitor } from '@/lib/monitoring/performance'
import { prisma } from '@/lib/prisma'

// Optimized Prisma client with connection pooling
export function createOptimizedPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20&connect_timeout=60'
      }
    }
  })
}

// Database query optimization utilities
export class QueryOptimizer {
  // Batch queries to reduce N+1 problems
  static async getGamesWithGMData(gameIds: string[]) {
    return performanceMonitor.measureAsync(
      'QueryOptimizer.getGamesWithGMData',
      async () => {
        // Single query to get all games with GM data
        return prisma.game.findMany({
          where: { id: { in: gameIds } },
          include: {
            gm: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                rating: true,
                reviewCount: true,
                isVerified: true,
              }
            },
            _count: {
              select: {
                bookings: { where: { status: 'CONFIRMED' } },
                reviews: true,
              }
            }
          }
        })
      }
    )
  }

  // Efficient search with full-text search
  static async searchGames(searchTerm: string, limit = 20) {
    return performanceMonitor.measureAsync(
      'QueryOptimizer.searchGames',
      async () => {
        // Use database full-text search for better performance
        return prisma.$queryRaw`
          SELECT g.*, 
                 u.username as gm_username,
                 u."firstName" as gm_first_name,
                 u."lastName" as gm_last_name,
                 u.rating as gm_rating,
                 u."isVerified" as gm_verified,
                 (SELECT COUNT(*) FROM bookings b WHERE b."gameId" = g.id AND b.status = 'CONFIRMED') as booking_count
          FROM games g
          JOIN users u ON g."gmId" = u.id
          WHERE g."isActive" = true 
            AND g."startDate" > NOW()
            AND (
              g.title ILIKE ${`%${searchTerm}%`}
              OR g.description ILIKE ${`%${searchTerm}%`}
              OR ${searchTerm} = ANY(g.tags)
            )
          ORDER BY 
            CASE 
              WHEN g.title ILIKE ${`%${searchTerm}%`} THEN 1
              WHEN ${searchTerm} = ANY(g.tags) THEN 2
              ELSE 3
            END,
            g."startDate" ASC
          LIMIT ${limit}
        `
      }
    )
  }

  // Aggregated stats query
  static async getGameSystemStats() {
    return performanceMonitor.measureAsync(
      'QueryOptimizer.getGameSystemStats',
      async () => {
        return prisma.game.groupBy({
          by: ['gameSystem'],
          where: {
            isActive: true,
            startDate: { gte: new Date() }
          },
          _count: {
            id: true
          },
          _avg: {
            pricePerSession: true,
            maxPlayers: true,
          },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        })
      }
    )
  }
}