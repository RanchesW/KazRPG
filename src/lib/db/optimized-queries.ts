// ===== src/lib/db/optimized-queries.ts =====
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/types/prisma'
import { performanceMonitor } from '@/lib/monitoring/performance'

interface GameFilters {
  city?: string
  gameSystem?: string
  isOnline?: boolean
  language?: string
  difficulty?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  startDate?: Date
  endDate?: Date
}

interface PaginationOptions {
  page: number
  limit: number
}

export class GameRepository {
  async findGamesWithFilters(
    filters: GameFilters,
    pagination: PaginationOptions
  ) {
    return performanceMonitor.measureAsync(
      'GameRepository.findGamesWithFilters',
      async () => {
        const where: Prisma.GameWhereInput = {
          isActive: true,
          startDate: { gte: new Date() },
        }

        // Apply filters
        if (filters.city) where.city = filters.city
        if (filters.gameSystem) where.gameSystem = filters.gameSystem as any
        if (filters.isOnline !== undefined) where.isOnline = filters.isOnline
        if (filters.language) where.language = filters.language as any
        if (filters.difficulty) where.difficulty = filters.difficulty as any
        
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          where.pricePerSession = {}
          if (filters.minPrice !== undefined) where.pricePerSession.gte = filters.minPrice
          if (filters.maxPrice !== undefined) where.pricePerSession.lte = filters.maxPrice
        }

        if (filters.startDate || filters.endDate) {
          where.startDate = {}
          if (filters.startDate) where.startDate.gte = filters.startDate
          if (filters.endDate) where.startDate.lte = filters.endDate
        }

        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
            { tags: { contains: filters.search } },
          ]
        }

        // Single optimized query with all needed data
        const [games, total] = await Promise.all([
          prisma.game.findMany({
            where,
            select: {
              id: true,
              title: true,
              description: true,
              gameSystem: true,
              platform: true,
              maxPlayers: true,
              currentPlayers: true,
              pricePerSession: true,
              duration: true,
              difficulty: true,
              tags: true,
              imageUrl: true,
              isOnline: true,
              city: true,
              address: true,
              startDate: true,
              endDate: true,
              language: true,
              createdAt: true,
              gm: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  rating: true,
                  city: true,
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
              { startDate: 'asc' },
              { createdAt: 'desc' }
            ],
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
          }),
          prisma.game.count({ where })
        ])

        return {
          games,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit)
          }
        }
      }
    )
  }

  async findGameById(id: string) {
    return performanceMonitor.measureAsync(
      'GameRepository.findGameById',
      async () => {
        return prisma.game.findUnique({
          where: { id },
          include: {
            gm: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
                rating: true,
                reviewCount: true,
                city: true,
                isVerified: true,
                experience: true,
                createdAt: true,
              }
            },
            bookings: {
              where: { status: 'CONFIRMED' },
              select: {
                id: true,
                playerCount: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  }
                }
              }
            },
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
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

  async getGameStats(gmId: string) {
    return performanceMonitor.measureAsync(
      'GameRepository.getGameStats',
      async () => {
        const [totalGames, completedGames, averageRating, totalPlayers] = await Promise.all([
          prisma.game.count({
            where: { gmId, isActive: true }
          }),
          prisma.game.count({
            where: { gmId, endDate: { lt: new Date() } }
          }),
          prisma.review.aggregate({
            where: { targetId: gmId },
            _avg: { rating: true }
          }),
          prisma.booking.count({
            where: {
              game: { gmId },
              status: 'CONFIRMED'
            }
          })
        ])

        return {
          totalGames,
          completedGames,
          averageRating: averageRating._avg.rating || 0,
          totalPlayers,
        }
      }
    )
  }
}

export class UserRepository {
  async findByEmailOrUsername(email: string, username: string) {
    return performanceMonitor.measureAsync(
      'UserRepository.findByEmailOrUsername',
      async () => {
        return prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }]
          },
          select: {
            id: true,
            email: true,
            username: true,
          }
        })
      }
    )
  }

  async updateUserRating(userId: string) {
    return performanceMonitor.measureAsync(
      'UserRepository.updateUserRating',
      async () => {
        // Calculate new rating from reviews
        const stats = await prisma.review.aggregate({
          where: { targetId: userId },
          _avg: { rating: true },
          _count: true,
        })

        return prisma.user.update({
          where: { id: userId },
          data: {
            rating: stats._avg.rating || 0,
            reviewCount: stats._count,
          }
        })
      }
    )
  }
}

export const gameRepository = new GameRepository()
export const userRepository = new UserRepository()