// ===== src/lib/errors/handler.ts =====
import { NextResponse } from 'next/server'
import { AppError } from './types'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'
import { Prisma } from '@/types/prisma'

export interface ErrorResponse {
  error: {
    message: string
    code: string
    timestamp: string
    requestId?: string
  }
  details?: any
}

export function handleApiError(
  error: unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  logger.error('API Error:', { error, requestId })

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          requestId,
        },
        details: error.errors,
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { code, message } = error
    
    switch (code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              message: 'Resource already exists',
              code: 'DUPLICATE_RESOURCE',
              timestamp: new Date().toISOString(),
              requestId,
            },
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              message: 'Resource not found',
              code: 'NOT_FOUND',
              timestamp: new Date().toISOString(),
              requestId,
            },
          },
          { status: 404 }
        )
      default:
        logger.error('Prisma error:', { code, message, requestId })
        return NextResponse.json(
          {
            error: {
              message: 'Database error',
              code: 'DATABASE_ERROR',
              timestamp: new Date().toISOString(),
              requestId,
            },
          },
          { status: 500 }
        )
    }
  }

  // Handle unexpected errors
  logger.error('Unexpected error:', error)
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: 500 }
  )
}