// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { handleApiError } from '@/lib/errors/handler'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const gameSystem = searchParams.get('gameSystem') || ''
    const city = searchParams.get('city') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const isOnline = searchParams.get('isOnline')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    if (gameSystem) {
      where.gameSystem = gameSystem
    }

    if (city) {
      where.city = city
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (isOnline) {
      where.isOnline = isOnline === 'true'
    }


    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          gm: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              rating: true,
              reviewCount: true
            }
          }
        }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: Добавить аутентификацию и получение ID пользователя из сессии
    const gmId = 'temp-user-id' // Заглушка
    
    const {
      title,
      description,
      gameSystem,
      platform,
      maxPlayers,
      pricePerSession,
      duration,
      difficulty,
      tags,
      isOnline,
      city,
      address,
      startDate,
      language
    } = body
    
    const gameData = {
      title,
      description,
      gameSystem,
      platform,
      maxPlayers,
      pricePerSession,
      duration,
      difficulty,
      tags,
      isOnline,
      city,
      address,
      startDate: new Date(startDate),
      language,
      gmId
    }
    
    const game = await prisma.game.create({
      data: gameData,
      include: {
        gm: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rating: true,
            reviewCount: true
          }
        }
      }
    })
    
    return NextResponse.json(game, { status: 201 })
    
  } catch (error) {
    return handleApiError(error)
  }
}
