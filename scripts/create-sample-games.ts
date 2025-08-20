// scripts/create-sample-games.ts
// Скрипт для создания примеров игр с красивыми slug'ами

import { PrismaClient, GameSystem, Difficulty, Language } from '@prisma/client'
import { generateGameSlug } from '../src/lib/slug'

const prisma = new PrismaClient()

// Сначала создадим тестового пользователя
async function createTestUser() {
  const user = await prisma.user.upsert({
    where: { email: 'testgm@kazrpg.kz' },
    update: {},
    create: {
      email: 'testgm@kazrpg.kz',
      username: 'testgm',
      firstName: 'Иван',
      lastName: 'Иванов',
      city: 'Алматы',
      hashedPassword: 'hashed_password_here',
      isGM: true,
      isVerified: true,
      rating: 4.8,
      reviewCount: 15
    }
  })
  return user
}

async function createSampleGames() {
  console.log('Создаем тестового пользователя...')
  const user = await createTestUser()
  
  console.log('Создаем примеры игр с красивыми slug\'ами...')
  
  const sampleGames = [
    {
      title: 'Драконы и Подземелья: Начало приключений',
      description: 'Классическая кампания D&D 5e для новичков. Изучаем основы игры, создаем персонажей и отправляемся в первое приключение!',
      gameSystem: GameSystem.DND5E,
      maxPlayers: 5,
      difficulty: Difficulty.BEGINNER_FRIENDLY,
      city: 'Алматы',
      isOnline: false,
      startDate: new Date('2025-09-01T18:00:00Z'),
      pricePerSession: 3000,
      duration: 240
    },
    {
      title: 'Зов Ктулху: Тайны Аркхэма',
      description: 'Мистический хоррор в духе Лавкрафта. Следователи раскрывают жуткие тайны в городе Аркхэм. Только для опытных игроков!',
      gameSystem: GameSystem.CALL_OF_CTHULHU,
      maxPlayers: 4,
      difficulty: Difficulty.ADVANCED,
      city: 'Астана',
      isOnline: true,
      startDate: new Date('2025-09-05T20:00:00Z'),
      pricePerSession: 4000,
      duration: 180
    },
    {
      title: 'Pathfinder: Восхождение рун',
      description: 'Epic Adventure Path в мире Pathfinder. Классическая кампания от 1 до 20 уровня. Долгосрочная игра для серьезных игроков.',
      gameSystem: GameSystem.PATHFINDER2E,
      maxPlayers: 6,
      difficulty: Difficulty.EXPERT_ONLY,
      city: 'Шымкент',
      isOnline: false,
      startDate: new Date('2025-09-10T19:00:00Z'),
      pricePerSession: 5000,
      duration: 300
    },
    {
      title: 'Cyberpunk 2077: Night City Chronicles',
      description: 'Киберпанк в мегаполисе будущего. Корпоративные интриги, уличные банды и высокие технологии ждут смелых.',
      gameSystem: GameSystem.CYBERPUNK,
      maxPlayers: 4,
      difficulty: Difficulty.INTERMEDIATE,
      city: 'Алматы',
      isOnline: true,
      startDate: new Date('2025-09-15T21:00:00Z'),
      pricePerSession: 3500,
      duration: 200
    },
    {
      title: 'Вампиры: Маскарад - Кровавые интриги',
      description: 'Готик-панк мир Вампиров. Политические интриги, древние тайны и борьба за власть в ночном мире.',
      gameSystem: GameSystem.VAMPIRE,
      maxPlayers: 5,
      difficulty: Difficulty.INTERMEDIATE,
      city: 'Астана',
      isOnline: false,
      startDate: new Date('2025-09-20T20:30:00Z'),
      pricePerSession: 4500,
      duration: 250
    }
  ]
  
  for (const gameData of sampleGames) {
    try {
      // Генерируем slug
      const gameId = `sample-${Date.now()}-${Math.random().toString(36).substring(7)}`
      const slug = generateGameSlug(
        gameData.title,
        gameData.gameSystem,
        gameData.city,
        gameId
      )
      
      // Проверяем уникальность slug
      let finalSlug = slug
      let counter = 1
      
      while (await prisma.game.findUnique({ where: { slug: finalSlug } as any })) {
        finalSlug = `${slug}-${counter}`
        counter++
      }
      
      const game = await prisma.game.create({
        data: {
          ...gameData,
          slug: finalSlug,
          gmId: user.id,
          tags: JSON.stringify(['новичкам', 'эпично', 'атмосферно'])
        } as any
      })
      
      console.log(`✓ Создана игра: "${game.title}"`)
      console.log(`  URL: /games/${(game as any).slug}`)
      console.log(`  Система: ${game.gameSystem}`)
      console.log(`  Город: ${game.city}`)
      console.log()
      
    } catch (error) {
      console.error(`✗ Ошибка при создании игры "${gameData.title}":`, error)
    }
  }
  
  console.log('Создание примеров игр завершено!')
  console.log('\nПримеры красивых URL:')
  
  const games = await prisma.game.findMany({
    select: { title: true, slug: true } as any
  })
  
  games.forEach(game => {
    console.log(`• ${game.title}`)
    console.log(`  http://localhost:3000/games/${(game as any).slug}`)
  })
}

// Запуск скрипта
createSampleGames()
  .catch((error) => {
    console.error('Ошибка при выполнении скрипта:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
