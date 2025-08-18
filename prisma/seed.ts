// ===== prisma/seed.ts =====
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Создаём тестовые данные...')

  // Создаём тестовых пользователей
  const testPassword = await hashPassword('password123')

  const user1 = await prisma.user.upsert({
    where: { email: 'artem@kazrpg.kz' },
    update: {},
    create: {
      email: 'artem@kazrpg.kz',
      username: 'DM_Artem',
      firstName: 'Артем',
      lastName: 'Смирнов',
      hashedPassword: testPassword,
      city: 'Алматы',
      language: 'RU',
      isGM: true,
      isVerified: true,
      rating: 4.8,
      reviewCount: 25,
      experience: 'EXPERT'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'eldar@kazrpg.kz' },
    update: {},
    create: {
      email: 'eldar@kazrpg.kz',
      username: 'MasterEldar',
      firstName: 'Эльдар',
      lastName: 'Назарбаев',
      hashedPassword: testPassword,
      city: 'Алматы',
      language: 'RU',
      isGM: true,
      isVerified: true,
      rating: 4.9,
      reviewCount: 18,
      experience: 'ADVANCED'
    }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'aida@kazrpg.kz' },
    update: {},
    create: {
      email: 'aida@kazrpg.kz', 
      username: 'AidaGamer',
      firstName: 'Аида',
      lastName: 'Касымова',
      hashedPassword: testPassword,
      city: 'Астана',
      language: 'KK',
      isGM: false,
      experience: 'INTERMEDIATE'
    }
  })

  // Создаём тестовые игры
  const game1 = await prisma.game.create({
    data: {
      title: 'Приключения в Забытых Королевствах',
      description: 'Эпическая кампания D&D 5e для начинающих игроков. Исследуйте мир полный магии, драконов и древних тайн. Идеально подходит для тех, кто хочет попробовать настольные ролевые игры впервые.',
      gameSystem: 'DND5E',
      platform: 'DISCORD',
      maxPlayers: 5,
      currentPlayers: 2,
      pricePerSession: 2000,
      duration: 240,
      difficulty: 'BEGINNER_FRIENDLY',
      tags: ['Новичкам', 'Фэнтези', 'Онлайн', 'Кампания'],
      isOnline: true,
      startDate: new Date('2024-12-01T18:00:00Z'),
      endDate: new Date('2025-06-01T18:00:00Z'),
      isRecurring: true,
      language: 'RU',
      gmId: user1.id
    }
  })

  const game2 = await prisma.game.create({
    data: {
      title: 'Зов Ктулху: Тайны Алматы',
      description: 'Хоррор-расследование в современном Казахстане. Раскройте древние тайны, скрытые в сердце Алматы. Для игроков, которые любят мистику и атмосферные истории.',
      gameSystem: 'CALL_OF_CTHULHU',
      platform: 'IN_PERSON',
      maxPlayers: 4,
      currentPlayers: 3,
      pricePerSession: 2500,
      duration: 180,
      difficulty: 'INTERMEDIATE',
      tags: ['Хоррор', 'Расследование', 'Казахстан', 'Атмосфера'],
      isOnline: false,
      city: 'Алматы',
      address: 'кафе Dostyk Plaza, 2 этаж',
      startDate: new Date('2024-11-25T19:00:00Z'),
      language: 'RU',
      gmId: user2.id
    }
  })

  const game3 = await prisma.game.create({
    data: {
      title: 'Pathfinder 2e: Қазақ батырлары',
      description: 'Приключения в мире, вдохновленном казахскими легендами и мифологией. Станьте батырами и защитите степь от древнего зла.',
      gameSystem: 'PATHFINDER2E',
      platform: 'FOUNDRY',
      maxPlayers: 6,
      currentPlayers: 1,
      pricePerSession: 3000,
      duration: 300,
      difficulty: 'ADVANCED',
      tags: ['Казахская мифология', 'Эпик', 'Pathfinder'],
      isOnline: true,
      startDate: new Date('2024-12-15T20:00:00Z'),
      language: 'KK',
      gmId: user1.id
    }
  })

  // Создаём тестовые бронирования
  await prisma.booking.create({
    data: {
      userId: user3.id,
      gameId: game1.id,
      status: 'CONFIRMED',
      playerCount: 1,
      message: 'Очень хочу попробовать D&D впервые!',
      totalPrice: 2000
    }
  })

  await prisma.booking.create({
    data: {
      userId: user3.id,
      gameId: game2.id,
      status: 'PENDING',
      playerCount: 1,
      message: 'Интересует хоррор-сеттинг'
    }
  })

  // Создаём тестовые отзывы
  await prisma.review.create({
    data: {
      authorId: user3.id,
      targetId: user1.id,
      gameId: game1.id,
      rating: 5,
      comment: 'Отличный мастер! Очень терпеливо объяснял правила новичкам. Атмосфера была просто потрясающей!'
    }
  })

  console.log('✅ Тестовые данные созданы!')
  console.log('📧 Тестовые аккаунты:')
  console.log('   - artem@kazrpg.kz / password123 (ГМ)')
  console.log('   - eldar@kazrpg.kz / password123 (ГМ)')
  console.log('   - aida@kazrpg.kz / password123 (Игрок)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })