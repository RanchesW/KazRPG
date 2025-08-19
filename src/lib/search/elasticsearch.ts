// ===== src/lib/search/elasticsearch.ts =====
import { Client } from '@elastic/elasticsearch'
import { env } from '@/lib/env'
import { structuredLogger } from '@/lib/logger'

interface SearchableGame {
  id: string
  title: string
  description: string
  gameSystem: string
  difficulty: string
  language: string
  city?: string
  isOnline: boolean
  tags: string[]
  pricePerSession?: number
  startDate: string
  gmUsername: string
  gmRating: number
  gmIsVerified: boolean
}

class SearchService {
  private client: Client | null = null
  private readonly indexName = 'kazrpg-games'

  constructor() {
    if (env.ELASTICSEARCH_URL) {
      this.client = new Client({
        node: env.ELASTICSEARCH_URL,
        auth: env.ELASTICSEARCH_USERNAME ? {
          username: env.ELASTICSEARCH_USERNAME,
          password: env.ELASTICSEARCH_PASSWORD!
        } : undefined,
      })
    }
  }

  async initialize() {
    if (!this.client) return

    try {
      // Check if index exists
      const indexExists = await this.client.indices.exists({
        index: this.indexName
      })

      if (!indexExists) {
        // Create index with mapping
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { 
                  type: 'text', 
                  analyzer: 'standard',
                  fields: {
                    keyword: { type: 'keyword' },
                    suggest: { type: 'completion' }
                  }
                },
                description: { type: 'text', analyzer: 'standard' },
                gameSystem: { type: 'keyword' },
                difficulty: { type: 'keyword' },
                language: { type: 'keyword' },
                city: { type: 'keyword' },
                isOnline: { type: 'boolean' },
                tags: { type: 'keyword' },
                pricePerSession: { type: 'integer' },
                startDate: { type: 'date' },
                gmUsername: { type: 'keyword' },
                gmRating: { type: 'float' },
                gmIsVerified: { type: 'boolean' },
                location: { type: 'geo_point' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' }
              }
            },
            settings: {
              analysis: {
                analyzer: {
                  russian_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'russian_stop', 'russian_stemmer']
                  }
                },
                filter: {
                  russian_stop: {
                    type: 'stop',
                    stopwords: '_russian_'
                  },
                  russian_stemmer: {
                    type: 'stemmer',
                    language: 'russian'
                  }
                }
              }
            }
          }
        })

        structuredLogger.info('Elasticsearch index created', { index: this.indexName })
      }
    } catch (error) {
      structuredLogger.error('Elasticsearch initialization error', error as Error)
    }
  }

  async indexGame(game: SearchableGame) {
    if (!this.client) return

    try {
      await this.client.index({
        index: this.indexName,
        id: game.id,
        body: {
          ...game,
          updatedAt: new Date().toISOString()
        }
      })

      structuredLogger.info('Game indexed successfully', { gameId: game.id })
    } catch (error) {
      structuredLogger.error('Game indexing error', error as Error, { gameId: game.id })
    }
  }

  async searchGames(params: {
    query?: string
    filters?: {
      gameSystem?: string[]
      difficulty?: string[]
      language?: string[]
      city?: string[]
      isOnline?: boolean
      priceRange?: { min?: number; max?: number }
      dateRange?: { start?: string; end?: string }
    }
    sort?: 'relevance' | 'date' | 'price' | 'rating'
    page?: number
    limit?: number
  }) {
    if (!this.client) {
      // Fallback to database search
      return this.fallbackSearch(params)
    }

    try {
      const {
        query = '',
        filters = {},
        sort = 'relevance',
        page = 1,
        limit = 20
      } = params

      const body: any = {
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        sort: this.buildSortQuery(sort),
        from: (page - 1) * limit,
        size: limit,
        highlight: {
          fields: {
            title: {},
            description: {}
          }
        }
      }

      // Add text search
      if (query) {
        body.query.bool.must.push({
          multi_match: {
            query,
            fields: ['title^3', 'description^2', 'tags^2', 'gmUsername'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        })
      } else {
        body.query.bool.must.push({ match_all: {} })
      }

      // Add filters
      if (filters.gameSystem?.length) {
        body.query.bool.filter.push({
          terms: { gameSystem: filters.gameSystem }
        })
      }

      if (filters.difficulty?.length) {
        body.query.bool.filter.push({
          terms: { difficulty: filters.difficulty }
        })
      }

      if (filters.language?.length) {
        body.query.bool.filter.push({
          terms: { language: filters.language }
        })
      }

      if (filters.city?.length) {
        body.query.bool.filter.push({
          terms: { city: filters.city }
        })
      }

      if (filters.isOnline !== undefined) {
        body.query.bool.filter.push({
          term: { isOnline: filters.isOnline }
        })
      }

      if (filters.priceRange) {
        const priceFilter: any = {}
        if (filters.priceRange.min !== undefined) {
          priceFilter.gte = filters.priceRange.min
        }
        if (filters.priceRange.max !== undefined) {
          priceFilter.lte = filters.priceRange.max
        }
        
        if (Object.keys(priceFilter).length > 0) {
          body.query.bool.filter.push({
            range: { pricePerSession: priceFilter }
          })
        }
      }

      if (filters.dateRange) {
        const dateFilter: any = {}
        if (filters.dateRange.start) {
          dateFilter.gte = filters.dateRange.start
        }
        if (filters.dateRange.end) {
          dateFilter.lte = filters.dateRange.end
        }
        
        if (Object.keys(dateFilter).length > 0) {
          body.query.bool.filter.push({
            range: { startDate: dateFilter }
          })
        }
      }

      const response = await this.client.search({
        index: this.indexName,
        body
      })

      const games = response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight
      }))

      return {
        games,
        total: response.body.hits.total.value,
        page,
        limit,
        pages: Math.ceil(response.body.hits.total.value / limit)
      }
    } catch (error) {
      structuredLogger.error('Elasticsearch search error', error as Error, params)
      return this.fallbackSearch(params)
    }
  }

  async getSuggestions(query: string, limit = 5) {
    if (!this.client || !query) return []

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          suggest: {
            game_suggest: {
              prefix: query,
              completion: {
                field: 'title.suggest',
                size: limit
              }
            }
          }
        }
      })

      return response.body.suggest.game_suggest[0].options.map((option: any) => ({
        text: option.text,
        score: option._score
      }))
    } catch (error) {
      structuredLogger.error('Elasticsearch suggestions error', error as Error, { query })
      return []
    }
  }

  private buildSortQuery(sort: string) {
    switch (sort) {
      case 'date':
        return [{ startDate: { order: 'asc' } }]
      case 'price':
        return [{ pricePerSession: { order: 'asc' } }]
      case 'rating':
        return [{ gmRating: { order: 'desc' } }]
      case 'relevance':
      default:
        return ['_score', { startDate: { order: 'asc' } }]
    }
  }

  private async fallbackSearch(params: any) {
    // Implement database fallback search
    const { QueryOptimizer } = await import('@/lib/performance/database-optimization')
    
    if (params.query) {
      return QueryOptimizer.searchGames(params.query, params.limit)
    }
    
    // Return basic filtered results
    return { games: [], total: 0, page: 1, limit: 20, pages: 0 }
  }

  async deleteGame(gameId: string) {
    if (!this.client) return

    try {
      await this.client.delete({
        index: this.indexName,
        id: gameId
      })
    } catch (error) {
      structuredLogger.error('Game deletion from search index error', error as Error, { gameId })
    }
  }
}

export const searchService = new SearchService()
