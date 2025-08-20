// src/lib/slug.ts
import { GameSystem } from '@prisma/client'

/**
 * Генерирует slug для игры на основе названия, системы и города
 */
export function generateGameSlug(
  title: string,
  gameSystem: GameSystem,
  city?: string,
  id?: string
): string {
  // Транслитерация и очистка названия
  const cleanTitle = transliterateAndClean(title)
  
  // Системы игр в коротком формате
  const systemMap: Record<GameSystem, string> = {
    DND5E: 'dnd5e',
    PATHFINDER2E: 'pathfinder2e',
    CALL_OF_CTHULHU: 'cthulhu',
    VAMPIRE: 'vampire',
    CYBERPUNK: 'cyberpunk',
    SHADOWRUN: 'shadowrun',
    WARHAMMER40K: 'warhammer40k',
    OTHER: 'custom'
  }
  
  const parts = [
    cleanTitle,
    systemMap[gameSystem]
  ]
  
  // Добавляем город если указан
  if (city) {
    parts.push(transliterateAndClean(city))
  }
  
  // Добавляем короткий ID для уникальности
  if (id) {
    parts.push(id.slice(-6))
  }
  
  return parts.join('-').toLowerCase()
}

/**
 * Транслитерация кириллицы в латиницу и очистка
 */
function transliterateAndClean(text: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    
    // Казахские буквы
    'ә': 'ae', 'ғ': 'gh', 'қ': 'q', 'ң': 'ng', 'ө': 'oe', 'ұ': 'u', 'ү': 'ue', 'һ': 'h'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-') // Заменяем все не-буквенно-цифровые символы на дефисы
    .replace(/^-+|-+$/g, '') // Убираем дефисы в начале и конце
    .replace(/-+/g, '-') // Заменяем множественные дефисы на одинарные
    .slice(0, 50) // Ограничиваем длину
}

/**
 * Парсит slug и возвращает компоненты
 */
export function parseGameSlug(slug: string): {
  title?: string
  system?: string
  city?: string
  shortId?: string
} {
  const parts = slug.split('-')
  
  if (parts.length < 2) {
    return {}
  }
  
  return {
    title: parts[0],
    system: parts[1],
    city: parts.length > 3 ? parts[2] : undefined,
    shortId: parts[parts.length - 1]
  }
}

/**
 * Создает примеры красивых URL для игр
 */
export function createGameUrlExamples(): string[] {
  return [
    'drakon-i-podzemelya-dnd5e-almaty-a1b2c3',
    'zov-ktulhu-cthulhu-astana-d4e5f6',
    'vampiry-maskarad-vampire-shymkent-g7h8i9',
    'cyberpunk-2077-cyberpunk-almaty-j0k1l2',
    'pathfinder-rise-of-runelords-pathfinder2e-m3n4o5'
  ]
}
