// Simple SQLite wrapper to bypass Prisma client generation issues
import Database from 'sqlite3';
import { promisify } from 'util';

let db: any = null;

function getDatabase() {
  if (!db) {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database('./prisma/dev.db');
    
    // Promisify the database methods
    db.getAsync = promisify(db.get.bind(db));
    db.allAsync = promisify(db.all.bind(db));
    db.runAsync = promisify(db.run.bind(db));
  }
  return db;
}

export class SimpleGameRepository {
  static async findGames(filters: any = {}, page = 1, limit = 12) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE g.isActive = 1';
    const params: any[] = [];
    
    if (filters.search) {
      whereClause += ' AND (g.title LIKE ? OR g.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.city) {
      whereClause += ' AND g.city = ?';
      params.push(filters.city);
    }
    
    if (filters.gameSystem) {
      whereClause += ' AND g.gameSystem = ?';
      params.push(filters.gameSystem);
    }
    
    if (filters.isOnline !== undefined) {
      whereClause += ' AND g.isOnline = ?';
      params.push(filters.isOnline ? 1 : 0);
    }
    
    if (filters.language) {
      whereClause += ' AND g.language = ?';
      params.push(filters.language);
    }
    
    if (filters.difficulty) {
      whereClause += ' AND g.difficulty = ?';
      params.push(filters.difficulty);
    }

    const query = `
      SELECT 
        g.*,
        u.id as gm_id,
        u.username as gm_username,
        u.firstName as gm_firstName,
        u.lastName as gm_lastName,
        u.avatar as gm_avatar,
        u.rating as gm_rating,
        u.city as gm_city,
        u.isVerified as gm_isVerified,
        (SELECT COUNT(*) FROM bookings b WHERE b.gameId = g.id AND b.status = 'CONFIRMED') as booking_count,
        (SELECT COUNT(*) FROM reviews r WHERE r.gameId = g.id) as review_count
      FROM games g
      JOIN users u ON g.gmId = u.id
      ${whereClause}
      ORDER BY g.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM games g
      JOIN users u ON g.gmId = u.id
      ${whereClause}
    `;
    
    try {
      const [games, countResult] = await Promise.all([
        db.allAsync(query, [...params, limit, offset]),
        db.getAsync(countQuery, params)
      ]);
      
      // Transform the results to match the expected format
      const transformedGames = games.map((game: any) => ({
        id: game.id,
        title: game.title,
        description: game.description,
        gameSystem: game.gameSystem,
        platform: game.platform,
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
        pricePerSession: game.pricePerSession,
        duration: game.duration,
        difficulty: game.difficulty,
        tags: game.tags,
        imageUrl: game.imageUrl,
        isOnline: Boolean(game.isOnline),
        city: game.city,
        address: game.address,
        startDate: game.startDate,
        endDate: game.endDate,
        isRecurring: Boolean(game.isRecurring),
        language: game.language,
        isActive: Boolean(game.isActive),
        gmId: game.gmId,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        gm: {
          id: game.gm_id,
          username: game.gm_username,
          firstName: game.gm_firstName,
          lastName: game.gm_lastName,
          avatar: game.gm_avatar,
          rating: game.gm_rating,
          city: game.gm_city,
          isVerified: Boolean(game.gm_isVerified)
        },
        _count: {
          bookings: game.booking_count,
          reviews: game.review_count
        }
      }));
      
      return {
        games: transformedGames,
        total: countResult.total,
        page,
        limit,
        pages: Math.ceil(countResult.total / limit)
      };
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
}