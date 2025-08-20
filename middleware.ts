// ===== middleware.ts =====
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                            req.nextUrl.pathname.startsWith('/games/create') ||
                            req.nextUrl.pathname.startsWith('/profile')
    const isGMRoute = req.nextUrl.pathname.startsWith('/gm')
    const isGamePage = req.nextUrl.pathname.startsWith('/games/')

    // Log beautiful game URLs for analytics
    if (isGamePage && req.nextUrl.pathname !== '/games' && req.nextUrl.pathname !== '/games/create') {
      const gameId = req.nextUrl.pathname.split('/games/')[1]
      if (gameId && !gameId.includes('?')) {
        console.log(`🎮 Game URL accessed: ${req.nextUrl.pathname}`)
        console.log(`📊 Game ID/Slug: ${gameId}`)
        console.log(`🌐 User Agent: ${req.headers.get('user-agent')}`)
        console.log(`📍 Referer: ${req.headers.get('referer') || 'Direct'}`)
      }
    }

    // Allow auth pages and API routes
    if (isAuthPage || isApiAuthRoute) {
      return NextResponse.next()
    }

    // Protect routes that require authentication
    if (isProtectedRoute && !token) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Protect GM routes
    if (isGMRoute && (!token || !token.isGM)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
        const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
        const isPublicRoute = req.nextUrl.pathname === '/' ||
                             req.nextUrl.pathname.startsWith('/games') ||
                             req.nextUrl.pathname.startsWith('/gms')

        // Allow public routes and auth routes
        if (isPublicRoute || isAuthPage || isApiAuthRoute) {
          return true
        }

        // For protected routes, require token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}