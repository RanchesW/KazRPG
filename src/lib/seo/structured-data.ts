// ===== src/lib/seo/structured-data.ts =====
import { GameWithGM, UserProfile } from '@/types'

export class StructuredDataGenerator {
  static generateGameLD(game: GameWithGM) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: game.title,
      description: game.description,
      startDate: game.startDate.toISOString(),
      endDate: game.endDate?.toISOString(),
      location: game.isOnline ? {
        '@type': 'VirtualLocation',
        url: 'https://kazrpg.kz'
      } : {
        '@type': 'Place',
        name: game.city,
        address: {
          '@type': 'PostalAddress',
          addressLocality: game.city,
          addressCountry: 'KZ'
        }
      },
      organizer: {
        '@type': 'Person',
        name: `${game.gm.firstName} ${game.gm.lastName}`,
        url: `https://kazrpg.kz/gms/${game.gm.username}`
      },
      offers: game.pricePerSession ? {
        '@type': 'Offer',
        price: game.pricePerSession,
        priceCurrency: 'KZT',
        availability: game.currentPlayers < game.maxPlayers ? 
          'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      } : undefined,
      maximumAttendeeCapacity: game.maxPlayers,
      eventAttendanceMode: game.isOnline ? 
        'https://schema.org/OnlineEventAttendanceMode' : 
        'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: game.imageUrl,
      url: `https://kazrpg.kz/games/${game.id}`,
      category: 'Entertainment',
      keywords: game.tags?.join(', '),
    }
  }

  static generateGMLD(gm: UserProfile) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: `${gm.firstName} ${gm.lastName}`,
      alternateName: gm.username,
      description: gm.bio,
      image: gm.avatar,
      url: `https://kazrpg.kz/gms/${gm.username}`,
      address: gm.city ? {
        '@type': 'PostalAddress',
        addressLocality: gm.city,
        addressCountry: 'KZ'
      } : undefined,
      aggregateRating: gm.reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: gm.rating,
        reviewCount: gm.reviewCount,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      knowsAbout: [
        'Dungeons & Dragons',
        'Tabletop RPG',
        'Game Mastering',
        'Role-playing Games'
      ],
      jobTitle: 'Game Master',
    }
  }

  static generateOrganizationLD() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'KazRPG',
      url: 'https://kazrpg.kz',
      logo: 'https://kazrpg.kz/images/logo.png',
      description: 'Платформа для поиска игр D&D и RPG в Казахстане',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KZ',
        addressLocality: 'Алматы'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@kazrpg.kz',
        contactType: 'Customer Service',
        availableLanguage: ['Russian', 'Kazakh', 'English']
      },
      sameAs: [
        'https://t.me/kazrpg',
        'https://instagram.com/kazrpg',
        'https://vk.com/kazrpg'
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Kazakhstan'
      },
      serviceType: 'Gaming Platform'
    }
  }

  static generateBreadcrumbLD(items: Array<{name: string, url: string}>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }
}