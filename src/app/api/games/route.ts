// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SimpleGameRepository } from '@/lib/simple-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const gameSystem = searchParams.get('gameSystem') || ''
    const isOnline = searchParams.get('isOnline')
    const language = searchParams.get('language') || ''
    const difficulty = searchParams.get('difficulty') || ''

    const filters = {
      search: search || undefined,
      city: city || undefined,
      gameSystem: gameSystem || undefined,
      isOnline: isOnline === 'true' ? true : isOnline === 'false' ? false : undefined,
      language: language || undefined,
      difficulty: difficulty || undefined,
    }

    const result = await SimpleGameRepository.findGames(filters, page, limit)

    return NextResponse.json({
      games: result.games,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    })

  } catch (error) {
    console.error('Games API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
