// ===== src/lib/api/middleware.ts =====
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth/config'
import { UnauthorizedError, ForbiddenError, RateLimitError } from '@/lib/errors/types'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/errors/handler'
import { nanoid } from 'nanoid'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    username: string
    isGM: boolean
    isVerified: boolean
  }
  requestId: string
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const requestId = nanoid()
    
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        throw new UnauthorizedError('Authentication required')
      }

      const authenticatedReq = Object.assign(req, {
        user: session.user,
        requestId,
      }) as AuthenticatedRequest

      return await handler(authenticatedReq)
    } catch (error) {
      return handleApiError(error, requestId)
    }
  }
}

export async function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  options: { limit: number; window: number } = { limit: 100, window: 60000 }
) {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    
    const { success } = await rateLimit.limit(ip, options)
    
    if (!success) {
      throw new RateLimitError()
    }

    return await handler(req)
  }
}

export async function withGMAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user.isGM) {
      throw new ForbiddenError('GM privileges required')
    }
    return await handler(req)
  })
}