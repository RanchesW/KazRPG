// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache/redis'

export async function GET() {
  const startTime = Date.now()
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown',
      cache: 'unknown',
    },
    response_time_ms: 0,
  }

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`
    health.checks.database = 'ok'
  } catch (error) {
    health.checks.database = 'error'
    health.status = 'error'
  }

  try {
    // Cache health check
    await cache.set('health:check', Date.now(), 10)
    const cached = await cache.get('health:check')
    health.checks.cache = cached ? 'ok' : 'error'
  } catch (error) {
    health.checks.cache = 'error'
  }

  health.response_time_ms = Date.now() - startTime

  const status = health.status === 'ok' ? 200 : 503

  return NextResponse.json(health, { status })
}

// src/app/api/auth/signup/route.ts - Fix the signup route path
export { POST } from '@/app/auth/signup/route'