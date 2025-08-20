import { PrismaClient, GameSystem, Difficulty } from '@prisma/client'
import { generateGameSlug } from '../src/lib/slug'
import { createGameWithSlug } from '../src/lib/slug-queries'

const prisma = new PrismaClient()

async function createSampleGames() {
  try {
    console.log('Создаём пользователя-ГМ...')
    
    // Создаём пользователя-ГМ
    const gm = await prisma.user.upsert({
      where: { email: 'gm@kazrpg.com' },
      update: {},
      create: {
        id: 'gm-user-id',
        email: 'gm@kazrpg.com',
        username: 'MasterGM',
        firstName: 'Игорь',
        lastName: 'Смирнов',
        hashedPassword: 'hashed-password',
        isGM: true,
        city: 'Алматы',
        bio: 'Опытный мастер настольных игр',
      },
    })

    console.log('Создаём игры с красивыми URL...')

    const games = [
      {
        title: 'Драконы и Подземелья: Приключения в Алматы',
        description: 'Эпическое приключение в мире D&D 5e в современном Алматы',
        gameSystem: 'DND5E' as GameSystem,
        city: 'Алматы',
        difficulty: 'INTERMEDIATE' as Difficulty,
        tags: 'фэнтези,приключения,городская'
      },
      {
        title: 'Pathfinder: Путь к Астане',
        description: 'Классическое fantasy приключение по пути в столицу',
        gameSystem: 'PATHFINDER' as GameSystem,
        city: 'Астана',
        difficulty: 'ADVANCED' as Difficulty,
        tags: 'фэнтези,путешествие,политика'
      },
      {
        title: 'Call of Cthulhu: Тайны Шымкента',
        description: 'Мистический детектив в южной столице Казахстана',
        gameSystem: 'CALL_OF_CTHULHU' as GameSystem,
        city: 'Шымкент',
        difficulty: 'INTERMEDIATE' as Difficulty,
        tags: 'хоррор,детектив,мистика'
      },
      {
        title: 'Vampire: The Masquerade - Ночи Караганды',
        description: 'Политические интриги вампиров в промышленном городе',
        gameSystem: 'VAMPIRE' as GameSystem,
        city: 'Караганда',
        difficulty: 'ADVANCED' as Difficulty,
        tags: 'вампиры,политика,драма'
      },
      {
        title: 'GURPS: Космопорт Байконур',
        description: 'Научно-фантастическое приключение на космодроме',
        gameSystem: 'GURPS' as GameSystem,
        city: 'Байконур',
        difficulty: 'BEGINNER' as Difficulty,
        tags: 'научная-фантастика,космос,приключения'
      }
    ]

    for (const gameData of games) {
      const slug = generateGameSlug(gameData.title, gameData.gameSystem, gameData.city)
      
      const gameId = await createGameWithSlug({
        title: gameData.title,
        description: gameData.description,
        gameSystem: gameData.gameSystem,
        maxPlayers: 4,
        currentPlayers: Math.floor(Math.random() * 3),
        pricePerSession: Math.floor(Math.random() * 5000) + 2000,
        duration: 240, // 4 часа
        difficulty: gameData.difficulty,
        tags: gameData.tags,
        city: gameData.city,
        startDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        language: 'RU',
        isOnline: Math.random() > 0.5,
        gmId: gm.id,
        slug: slug
      })

      console.log(`✅ Создана игра: ${gameData.title}`)
      console.log(`   URL: /games/${slug}`)
      console.log('')
    }

    console.log('🎉 Все игры созданы успешно!')

  } catch (error) {
    console.error('❌ Ошибка создания игр:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleGames()
