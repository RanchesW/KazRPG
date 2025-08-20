// ===== src/lib/seo/meta-generator.ts =====
import { Metadata } from 'next'
import { GameWithGM, UserProfile } from '@/types'

export class SEOMetaGenerator {
  static generateGameMeta(game: GameWithGM): Metadata {
    const title = `${game.title} | ${game.gm.firstName} ${game.gm.lastName} | KazRPG`
    const description = `${game.description.substring(0, 160)}... Игра в ${game.gameSystem} с мастером ${game.gm.username}. ${game.isOnline ? 'Онлайн' : game.city} игра для ${game.maxPlayers} игроков.`
    
    const gameKeywords = game.tags ? JSON.parse(game.tags) : []
    const keywords = [
      game.gameSystem,
      game.difficulty,
      game.language,
      ...gameKeywords,
      game.isOnline ? 'онлайн' : 'оффлайн',
      game.city || '',
      'D&D',
      'RPG',
      'настольные игры',
      'Казахстан'
    ].filter(Boolean)

    return {
      title,
      description,
      keywords: keywords.join(', '),
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://kazrpg.kz/games/${game.id}`,
        images: [
          {
            url: game.imageUrl || '/images/default-game.jpg',
            width: 1200,
            height: 630,
            alt: game.title,
          },
        ],
        siteName: 'KazRPG',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [game.imageUrl || '/images/default-game.jpg'],
      },
      alternates: {
        canonical: `https://kazrpg.kz/games/${game.id}`,
        languages: {
          'ru-RU': `https://kazrpg.kz/ru/games/${game.id}`,
          'kk-KZ': `https://kazrpg.kz/kk/games/${game.id}`,
          'en-US': `https://kazrpg.kz/en/games/${game.id}`,
        },
      },
      other: {
        'article:author': `${game.gm.firstName} ${game.gm.lastName}`,
        'article:published_time': game.createdAt.toISOString(),
        'game:price': game.pricePerSession?.toString() || '0',
        'game:currency': 'KZT',
        'game:players': `${game.currentPlayers}/${game.maxPlayers}`,
        'game:system': game.gameSystem,
        'game:difficulty': game.difficulty,
      },
    }
  }

  static generateGMMeta(gm: UserProfile): Metadata {
    const title = `${gm.firstName} ${gm.lastName} (${gm.username}) - Мастер D&D | KazRPG`
    const description = `${gm.bio || `Опытный мастер D&D из ${gm.city}. Рейтинг: ${gm.rating}/5 (${gm.reviewCount} отзывов). ${gm.isVerified ? 'Верифицированный' : ''} мастер с опытом ${gm.experience}.`}`
    
    return {
      title,
      description,
      keywords: [
        'мастер D&D',
        'ГМ',
        'DM',
        'RPG мастер',
        gm.city || '',
        gm.experience,
        'Казахстан',
        'настольные игры'
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'profile',
        url: `https://kazrpg.kz/gms/${gm.username}`,
        images: [
          {
            url: gm.avatar || '/images/default-avatar.jpg',
            width: 400,
            height: 400,
            alt: `${gm.firstName} ${gm.lastName}`,
          },
        ],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [gm.avatar || '/images/default-avatar.jpg'],
      },
      alternates: {
        canonical: `https://kazrpg.kz/gms/${gm.username}`,
      },
    }
  }

  static generateCityMeta(city: string, gameCount: number): Metadata {
    const title = `D&D игры в ${city} | ${gameCount} активных игр | KazRPG`
    const description = `Найдите игры D&D и RPG в ${city}. ${gameCount} активных игр с проверенными мастерами. Онлайн и оффлайн форматы для всех уровней опыта.`
    
    return {
      title,
      description,
      keywords: [
        `D&D ${city}`,
        `RPG ${city}`,
        `настольные игры ${city}`,
        'Казахстан',
        'ролевые игры'
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://kazrpg.kz/games?city=${encodeURIComponent(city)}`,
        images: [
          {
            url: `/images/cities/${city.toLowerCase()}.jpg`,
            width: 1200,
            height: 630,
            alt: `D&D игры в ${city}`,
          },
        ],
      },
      alternates: {
        canonical: `https://kazrpg.kz/games?city=${encodeURIComponent(city)}`,
      },
    }
  }
}
