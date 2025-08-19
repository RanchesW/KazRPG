// ===== src/app/robots.ts =====
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/admin/',
        '/auth/',
        '/payment/',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: 'https://kazrpg.kz/sitemap.xml',
    host: 'https://kazrpg.kz',
  }
}