// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma' // Temporarily disabled

export async function GET() {
  const startTime = Date.now()
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'skipped', // Temporarily disabled until Prisma client is generated
    },
    response_time_ms: 0,
  }

  // Temporarily disable database check until Prisma client is generated
  // try {
  //   // Database health check
  //   await prisma.$queryRaw`SELECT 1`
  //   health.checks.database = 'ok'
  // } catch (error) {
  //   health.checks.database = 'error'
  //   health.status = 'error'
  // }

  health.response_time_ms = Date.now() - startTime

  const status = health.status === 'ok' ? 200 : 503

  return NextResponse.json(health, { status })
}