// scripts/update-game-slugs.ts
// Скрипт для обновления существующих игр с slug'ами

import { PrismaClient } from '@prisma/client'
import { generateGameSlug } from '../src/lib/slug'

const prisma = new PrismaClient()

async function updateGameSlugs() {
  console.log('Начинаем обновление slug\'ов для игр...')
  
  // Получаем все игры
  const games = await prisma.game.findMany()
  
  console.log(`Найдено ${games.length} игр`)
  
  for (const game of games) {
    try {
      // Пропускаем игры, у которых уже есть slug
      if ((game as any).slug) {
        console.log(`⚠️ Игра "${game.title}" уже имеет slug`)
        continue
      }
      
      // Генерируем slug
      const slug = generateGameSlug(
        game.title,
        game.gameSystem,
        game.city || undefined,
        game.id
      )
      
      // Обновляем игру с использованием сырого SQL
      await prisma.$executeRaw`UPDATE games SET slug = ${slug} WHERE id = ${game.id}`
      
      console.log(`✓ Обновлена игра "${game.title}" -> ${slug}`)
      
    } catch (error) {
      console.error(`✗ Ошибка при обновлении игры "${game.title}":`, error)
    }
  }
  
  console.log('Обновление завершено!')
}

// Запуск скрипта
updateGameSlugs()
  .catch((error) => {
    console.error('Ошибка при выполнении скрипта:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
