// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const system = searchParams.get('system') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (system) {
      where.system = system
    }

    if (status) {
      where.status = status
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          gameMaster: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              rating: true
            }
          },
          _count: {
            select: {
              players: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.game.count({ where })
    ])

    return NextResponse.json({
      games,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}
