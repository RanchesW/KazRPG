// ===== src/components/seo/StructuredData.tsx =====
interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  )
}

// ===== src/app/sitemap.ts =====
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kazrpg.kz'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gms`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic game pages
  const games = await prisma.game.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 1000, // Limit for performance
  })

  const gamePages = games.map(game => ({
    url: `${baseUrl}/games/${game.id}`,
    lastModified: game.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // GM pages
  const gms = await prisma.user.findMany({
    where: { isGM: true, isVerified: true },
    select: { username: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  })

  const gmPages = gms.map(gm => ({
    url: `${baseUrl}/gms/${gm.username}`,
    lastModified: gm.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // City pages
  const cities = ['Алматы', 'Астана', 'Шымкент', 'Актобе', 'Тараз']
  const cityPages = cities.map(city => ({
    url: `${baseUrl}/games?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...gamePages, ...gmPages, ...cityPages]
}