// ===== src/app/api/games/route.ts =====
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors/handler'
import { gameSchema } from '@/lib/validations/game'
import { withAuth, withRateLimit } from '@/lib/api/middleware'
import { nanoid } from 'nanoid'

// GET /api/games - List games with filtering
async function getGamesHandler(req: NextRequest) {
  const requestId = nanoid()

  try {
    const { searchParams } = new URL(req.url)
    
    const filters = {
      city: searchParams.get('city'),
      gameSystem: searchParams.get('gameSystem'),
      isOnline: searchParams.get('isOnline') === 'true',
      language: searchParams.get('language'),
      difficulty: searchParams.get('difficulty'),
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '12'), 50),
    }

    const where: any = {
      isActive: true,
      startDate: { gte: new Date() }, // Only future games
    }

    if (filters.city) where.city = filters.city
    if (filters.gameSystem) where.gameSystem = filters.gameSystem
    if (filters.isOnline !== null) where.isOnline = filters.isOnline
    if (filters.language) where.language = filters.language
    if (filters.difficulty) where.difficulty = filters.difficulty
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ]
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
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
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.game.count({ where })
    ])

    return NextResponse.json({
      games,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

// POST /api/games - Create new game (requires GM auth)
const createGameHandler = withAuth(async (req) => {
  try {
    if (!req.user.isGM) {
      throw new ForbiddenError('Only GMs can create games')
    }

    const body = await req.json()
    const validatedData = gameSchema.parse(body)

    const game = await prisma.game.create({
      data: {
        ...validatedData,
        gmId: req.user.id,
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
            city: true,
            isVerified: true,
          }
        }
      }
    })

    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    return handleApiError(error, req.requestId)
  }
})

export const GET = withRateLimit(getGamesHandler)
export const POST = createGameHandler