// src/lib/slug-queries.ts
// Обходные функции для работы со slug до решения проблем с Prisma типами

import { prisma } from './prisma'

// Define GameSystem enum locally
export enum GameSystem {
  DND5E = 'DND5E',
  PATHFINDER = 'PATHFINDER',
  CALLOFCTHULHU = 'CALLOFCTHULHU',
  VAMPIRETHEMASQUERADE = 'VAMPIRETHEMASQUERADE',
  OTHER = 'OTHER'
}

/**
 * Находит игру по slug используя безопасный подход
 */
export async function findGameBySlug(slug: string) {
  try {
    // Временно используем все игры и фильтруем вручную до решения проблем с типами
    const games = await prisma.games.findMany()
    const result = games.find(game => (game as any).slug === slug)
    return result || null
  } catch (error) {
    console.error('Error finding game by slug:', error)
    return null
  }
}

/**
 * Находит игру по slug с включением связанных данных
 */
export async function findGameBySlugWithRelations(slug: string) {
  try {
    // Находим игру по slug используя безопасный подход
    const games = await prisma.games.findMany()
    const game = games.find(g => (g as any).slug === slug)
    
    if (!game) {
      return null
    }
    
    // Получаем связанные данные используя обычные Prisma запросы
    const [gm, bookings] = await Promise.all([
      prisma.users.findUnique({
        where: { id: game.gmId }
      }),
      prisma.bookings.findMany({
        where: { gameId: game.id }
      })
    ])
    
    return {
      ...game,
      gm,
      bookings: bookings || []
    }
  } catch (error) {
    console.error('Error finding game by slug with relations:', error)
    return null
  }
}

/**
 * Проверяет уникальность slug
 */
export async function isSlugUnique(slug: string, excludeId?: string) {
  try {
    let query = `SELECT id FROM games WHERE slug = '${slug}'`
    if (excludeId) {
      query += ` AND id != '${excludeId}'`
    }
    query += ' LIMIT 1'
    
    const result = await prisma.$queryRawUnsafe<any[]>(query)
    return result.length === 0
  } catch (error) {
    console.error('Error checking slug uniqueness:', error)
    return false
  }
}

/**
 * Обновляет slug для игры
 */
export async function updateGameSlug(gameId: string, slug: string) {
  try {
    await prisma.$executeRaw`
      UPDATE games SET slug = ${slug} WHERE id = ${gameId}
    `
    return true
  } catch (error) {
    console.error('Error updating game slug:', error)
    return false
  }
}

/**
 * Создает игру со slug
 */
export async function createGameWithSlug(gameData: any) {
  try {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const slug = gameData.slug
    const now = new Date().toISOString()

    // Создаем игру напрямую в базе данных
    await prisma.$executeRaw`
      INSERT INTO games (
        id, title, description, gameSystem, platform, maxPlayers, 
        currentPlayers, pricePerSession, duration, difficulty, tags, 
        imageUrl, isOnline, city, address, startDate, endDate, 
        isRecurring, language, isActive, gmId, createdAt, updatedAt, slug
      ) VALUES (
        ${id}, ${gameData.title}, ${gameData.description}, ${gameData.gameSystem}, 
        ${gameData.platform || null}, ${gameData.maxPlayers}, ${gameData.currentPlayers}, 
        ${gameData.pricePerSession || null}, ${gameData.duration || null}, ${gameData.difficulty}, 
        ${gameData.tags}, ${gameData.imageUrl || null}, ${gameData.isOnline ? 1 : 0}, 
        ${gameData.city || null}, ${gameData.address || null}, ${gameData.startDate.toISOString()}, 
        ${gameData.endDate?.toISOString() || null}, ${gameData.isRecurring ? 1 : 0}, 
        ${gameData.language}, ${gameData.isActive !== false ? 1 : 0}, ${gameData.gmId}, 
        ${now}, ${now}, ${slug}
      )
    `

    console.log(`Игра создана с ID: ${id} и slug: ${slug}`)
    return id
  } catch (error) {
    console.error('Error creating game with slug:', error)
    throw error
  }
}

/**
 * Получает все игры со slug для списка
 */
export async function getGamesWithSlug(where: any = {}, options: any = {}) {
  try {
    // Получаем игры без include для избежания проблем с типами
    const games = await prisma.games.findMany({
      where,
      orderBy: options.orderBy || {
        createdAt: 'desc'
      },
      skip: options.skip,
      take: options.take
    });
    
    // Получаем GM данные отдельно
    const gamesWithGM = await Promise.all(
      games.map(async (game) => {
        const [gm, bookingCount] = await Promise.all([
          prisma.users.findUnique({
            where: { id: game.gmId },
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              rating: true
            }
          }),
          prisma.bookings.count({
            where: { gameId: game.id }
          })
        ]);
        
        return {
          ...game,
          gm,
          _count: {
            bookings: bookingCount
          }
        };
      })
    );
    
    return gamesWithGM;
  } catch (error) {
    console.error('Error getting games with slug:', error);
    throw error;
  }
}
