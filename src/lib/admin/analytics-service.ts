// ===== src/lib/admin/analytics-service.ts =====
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache/redis'
import { performanceMonitor } from '@/lib/monitoring/performance'

interface AnalyticsData {
  userMetrics: {
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    newUsersThisWeek: number
    userGrowthRate: number
    gmPercentage: number
  }
  gameMetrics: {
    totalGames: number
    activeGames: number
    gamesCreatedToday: number
    gamesCreatedThisWeek: number
    averagePlayersPerGame: number
    popularSystems: Array<{system: string, count: number}>
  }
  bookingMetrics: {
    totalBookings: number
    confirmedBookings: number
    bookingsToday: number
    bookingsThisWeek: number
    conversionRate: number
    averageBookingValue: number
  }
  revenueMetrics: {
    totalRevenue: number
    revenueToday: number
    revenueThisWeek: number
    revenueThisMonth: number
    averageRevenuePerUser: number
    platformFee: number
  }
  performanceMetrics: {
    averageLoadTime: number
    errorRate: number
    uptime: number
    activeConnections: number
  }
}

export class AnalyticsService {
  async getDashboardData(timeRange: '24h' | '7d' | '30d' = '7d'): Promise<AnalyticsData> {
    const cacheKey = `analytics:dashboard:${timeRange}`
    
    // Try to get from cache first
    const cached = await cache.get<AnalyticsData>(cacheKey)
    if (cached) return cached

    const data = await performanceMonitor.measureAsync(
      'AnalyticsService.getDashboardData',
      async () => {
        const now = new Date()
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Parallel queries for better performance
        const [
          userStats,
          gameStats,
          bookingStats,
          revenueStats,
          systemStats,
        ] = await Promise.all([
          this.getUserMetrics(dayAgo, weekAgo),
          this.getGameMetrics(dayAgo, weekAgo),
          this.getBookingMetrics(dayAgo, weekAgo),
          this.getRevenueMetrics(dayAgo, weekAgo, monthAgo),
          this.getSystemStats(),
        ])

        return {
          userMetrics: userStats,
          gameMetrics: { ...gameStats, popularSystems: systemStats },
          bookingMetrics: bookingStats,
          revenueMetrics: revenueStats,
          performanceMetrics: await this.getPerformanceMetrics(),
        }
      }
    )

    // Cache for 10 minutes
    await cache.set(cacheKey, data, 600)
    return data
  }

  private async getUserMetrics(dayAgo: Date, weekAgo: Date) {
    const [totalUsers, activeUsers, newToday, newThisWeek, gmCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { updatedAt: { gte: weekAgo } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: dayAgo } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.user.count({
        where: { isGM: true }
      })
    ])

    const growthRate = totalUsers > 0 ? (newThisWeek / totalUsers) * 100 : 0
    const gmPercentage = totalUsers > 0 ? (gmCount / totalUsers) * 100 : 0

    return {
      totalUsers,
      activeUsers,
      newUsersToday: newToday,
      newUsersThisWeek: newThisWeek,
      userGrowthRate: Math.round(growthRate * 100) / 100,
      gmPercentage: Math.round(gmPercentage * 100) / 100,
    }
  }

  private async getGameMetrics(dayAgo: Date, weekAgo: Date) {
    const [totalGames, activeGames, gamesToday, gamesThisWeek, avgPlayers] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({
        where: { 
          isActive: true,
          startDate: { gte: new Date() }
        }
      }),
      prisma.game.count({
        where: { createdAt: { gte: dayAgo } }
      }),
      prisma.game.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.game.aggregate({
        _avg: { currentPlayers: true },
        where: { isActive: true }
      })
    ])

    return {
      totalGames,
      activeGames,
      gamesCreatedToday: gamesToday,
      gamesCreatedThisWeek: gamesThisWeek,
      averagePlayersPerGame: Math.round((avgPlayers._avg.currentPlayers || 0) * 100) / 100,
    }
  }

  private async getBookingMetrics(dayAgo: Date, weekAgo: Date) {
    const [totalBookings, confirmedBookings, bookingsToday, bookingsThisWeek, avgValue] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: 'CONFIRMED' }
      }),
      prisma.booking.count({
        where: { createdAt: { gte: dayAgo } }
      }),
      prisma.booking.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.booking.aggregate({
        _avg: { totalPrice: true },
        where: { status: 'CONFIRMED' }
      })
    ])

    const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0

    return {
      totalBookings,
      confirmedBookings,
      bookingsToday: bookingsToday,
      bookingsThisWeek: bookingsThisWeek,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageBookingValue: Math.round((avgValue._avg.totalPrice || 0) * 100) / 100,
    }
  }

  private async getRevenueMetrics(dayAgo: Date, weekAgo: Date, monthAgo: Date) {
    // TODO: Implement payment model and uncomment when ready
    const [totalRevenue, revenueToday, revenueWeek, revenueMonth, userCount] = await Promise.all([
      // Placeholder values until payment model is implemented
      Promise.resolve({ _sum: { amount: 0 } }),
      Promise.resolve({ _sum: { amount: 0 } }),
      Promise.resolve({ _sum: { amount: 0 } }),
      Promise.resolve({ _sum: { amount: 0 } }),
      prisma.user.count()
    ])

    const total = totalRevenue._sum.amount || 0
    const platformFee = total * 0.05 // 5% platform fee
    const arpu = userCount > 0 ? total / userCount : 0

    return {
      totalRevenue: total,
      revenueToday: revenueToday._sum.amount || 0,
      revenueThisWeek: revenueWeek._sum.amount || 0,
      revenueThisMonth: revenueMonth._sum.amount || 0,
      averageRevenuePerUser: Math.round(arpu * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
    }
  }

  private async getSystemStats() {
    const systems = await prisma.game.groupBy({
      by: ['gameSystem'],
      _count: { gameSystem: true },
      where: { isActive: true },
      orderBy: { _count: { gameSystem: 'desc' } },
      take: 10
    })

    return systems.map((s: { gameSystem: string; _count: { gameSystem: number } }) => ({
      system: s.gameSystem,
      count: s._count.gameSystem
    }))
  }

  private async getPerformanceMetrics() {
    // These would come from your monitoring system
    return {
      averageLoadTime: 250, // ms
      errorRate: 0.02, // 2%
      uptime: 99.9, // %
      activeConnections: 150,
    }
  }

  async getDetailedReport(startDate: Date, endDate: Date) {
    return performanceMonitor.measureAsync(
      'AnalyticsService.getDetailedReport',
      async () => {
        const [
          userReport,
          gameReport,
          revenueReport,
          geographicReport,
        ] = await Promise.all([
          this.getUserReport(startDate, endDate),
          this.getGameReport(startDate, endDate),
          this.getRevenueReport(startDate, endDate),
          this.getGeographicReport(startDate, endDate),
        ])

        return {
          period: { startDate, endDate },
          users: userReport,
          games: gameReport,
          revenue: revenueReport,
          geographic: geographicReport,
          generatedAt: new Date(),
        }
      }
    )
  }

  private async getUserReport(startDate: Date, endDate: Date) {
    const usersByDay = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN is_gm = true THEN 1 END) as gm_count
      FROM users 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    return { usersByDay }
  }

  private async getGameReport(startDate: Date, endDate: Date) {
    const gamesBySystem = await prisma.game.groupBy({
      by: ['gameSystem'],
      _count: { gameSystem: true },
      _avg: { currentPlayers: true },
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    })

    return { gamesBySystem }
  }

  private async getRevenueReport(startDate: Date, endDate: Date) {
    const revenueByDay = await prisma.$queryRaw`
      SELECT 
        DATE(completed_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as transaction_count
      FROM payments 
      WHERE status = 'COMPLETED' 
        AND completed_at >= ${startDate} 
        AND completed_at <= ${endDate}
      GROUP BY DATE(completed_at)
      ORDER BY date
    `

    return { revenueByDay }
  }

  private async getGeographicReport(startDate: Date, endDate: Date) {
    const usersByCity = await prisma.user.groupBy({
      by: ['city'],
      _count: { city: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        city: { not: null }
      },
      orderBy: { _count: { city: 'desc' } }
    })

    return { usersByCity }
  }
}

export const analyticsService = new AnalyticsService()

