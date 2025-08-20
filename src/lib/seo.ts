// src/lib/seo.ts
// SEO утилиты для красивых URL игр

import { games } from '@prisma/client'
import { parseGameSlug } from './slug'

/**
 * Генерирует SEO-мета данные на основе slug'а игры
 */
export function generateGameSEOFromSlug(slug: string, game?: games) {
  const parsed = parseGameSlug(slug)
  
  const title = game?.title || generateTitleFromSlug(parsed)
  const description = game?.description || generateDescriptionFromSlug(parsed)
  
  return {
    title: `${title} | KazRPG - Настольные игры в Казахстане`,
    description: description.slice(0, 160), // SEO limit
    keywords: [
      parsed.system,
      parsed.city,
      'настольные игры',
      'ролевые игры',
      'казахстан',
      'НРИ'
    ].filter(Boolean),
    url: `/games/${slug}`,
    type: 'article',
    image: game?.imageUrl || '/images/default-game.jpg'
  }
}

/**
 * Генерирует заголовок на основе slug'а
 */
function generateTitleFromSlug(parsed: ReturnType<typeof parseGameSlug>): string {
  const parts = []
  
  if (parsed.title) {
    parts.push(capitalizeFirst(parsed.title.replace(/-/g, ' ')))
  }
  
  if (parsed.system) {
    const systemNames: Record<string, string> = {
      'dnd5e': 'D&D 5e',
      'pathfinder2e': 'Pathfinder 2e',
      'cthulhu': 'Call of Cthulhu',
      'vampire': 'Vampire: The Masquerade',
      'cyberpunk': 'Cyberpunk',
      'shadowrun': 'Shadowrun',
      'warhammer40k': 'Warhammer 40K'
    }
    parts.push(systemNames[parsed.system] || parsed.system.toUpperCase())
  }
  
  if (parsed.city) {
    const cityNames: Record<string, string> = {
      'almaty': 'Алматы',
      'astana': 'Астана',
      'shymkent': 'Шымкент',
      'aktobe': 'Актобе',
      'kostanay': 'Костанай'
    }
    parts.push(`в ${cityNames[parsed.city] || parsed.city}`)
  }
  
  return parts.join(' - ')
}

/**
 * Генерирует описание на основе slug'а
 */
function generateDescriptionFromSlug(parsed: ReturnType<typeof parseGameSlug>): string {
  const systemDescriptions: Record<string, string> = {
    'dnd5e': 'Классическая настольная ролевая игра D&D 5-й редакции.',
    'pathfinder2e': 'Эпическая фэнтези система Pathfinder 2е.',
    'cthulhu': 'Мистический хоррор в духе произведений Лавкрафта.',
    'vampire': 'Готик-панк мир Вампиров с политическими интригами.',
    'cyberpunk': 'Киберпанк будущего с высокими технологиями.',
    'shadowrun': 'Смесь киберпанка и фэнтези.',
    'warhammer40k': 'Мрачное далёкое будущее вселенной Warhammer 40,000.'
  }
  
  const baseDescription = parsed.system ? 
    systemDescriptions[parsed.system] || 'Увлекательная настольная ролевая игра.' :
    'Настольная ролевая игра для компании друзей.'
  
  const cityPart = parsed.city ? 
    ` Игра проходит в городе ${parsed.city.charAt(0).toUpperCase() + parsed.city.slice(1)}.` : 
    ''
  
  return `${baseDescription}${cityPart} Присоединяйтесь к игре на платформе KazRPG!`
}

/**
 * Делает первую букву заглавной
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Создает breadcrumbs для игры
 */
export function generateGameBreadcrumbs(slug: string, game?: games) {
  const parsed = parseGameSlug(slug)
  
  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Игры', href: '/games' }
  ]
  
  if (parsed.system) {
    breadcrumbs.push({
      label: parsed.system.toUpperCase(),
      href: `/games?gameSystem=${parsed.system.toUpperCase()}`
    })
  }
  
  if (parsed.city) {
    breadcrumbs.push({
      label: parsed.city.charAt(0).toUpperCase() + parsed.city.slice(1),
      href: `/games?city=${parsed.city}`
    })
  }
  
  breadcrumbs.push({
    label: game?.title || generateTitleFromSlug(parsed),
    href: `/games/${slug}`
  })
  
  return breadcrumbs
}

/**
 * Предлагает похожие игры на основе slug'а
 */
export function getSimilarGamesQuery(slug: string) {
  const parsed = parseGameSlug(slug)
  
  return {
    where: {
      OR: [
        parsed.system ? { gameSystem: parsed.system.toUpperCase() } : {},
        parsed.city ? { city: { contains: parsed.city, mode: 'insensitive' } } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    },
    take: 4,
    orderBy: {
      createdAt: 'desc' as const
    }
  }
}
