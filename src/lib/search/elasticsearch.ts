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
  location?: { lat: number; lon: number }
  createdAt?: string
  updatedAt?: string
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
          settings: {
            index: {
              analysis: {
                analyzer: {
                  russian_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'russian_stop', 'russian_stemmer']
                  },
                  multilingual_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'asciifolding']
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
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { 
                type: 'text', 
                analyzer: 'multilingual_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' },
                  russian: { type: 'text', analyzer: 'russian_analyzer' }
                }
              },
              description: { 
                type: 'text', 
                analyzer: 'multilingual_analyzer',
                fields: {
                  russian: { type: 'text', analyzer: 'russian_analyzer' }
                }
              },
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
          }
        })

        structuredLogger.info('Elasticsearch index created', { index: this.indexName })
      }
    } catch (error) {
      structuredLogger.error('Elasticsearch initialization error', error instanceof Error ? error : new Error('Unknown initialization error'))
    }
  }

  async indexGame(game: SearchableGame) {
    if (!this.client) return

    try {
      const gameData = {
        ...game,
        updatedAt: new Date().toISOString(),
        createdAt: game.createdAt || new Date().toISOString()
      }

      await this.client.index({
        index: this.indexName,
        id: game.id,
        document: gameData
      })

      structuredLogger.info('Game indexed successfully', { gameId: game.id })
    } catch (error) {
      structuredLogger.error('Game indexing error', error instanceof Error ? error : new Error('Unknown indexing error'), { gameId: game.id })
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
      location?: { lat: number; lon: number; radius: string }
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

      const searchQuery: any = {
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
            'title.russian': {},
            description: {},
            'description.russian': {}
          }
        }
      }

      // Add text search with multilingual support
      if (query) {
        searchQuery.query.bool.must.push({
          multi_match: {
            query,
            fields: [
              'title^5', 
              'title.russian^5', 
              'description^3', 
              'description.russian^3', 
              'tags^2', 
              'gmUsername'
            ],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        })
      } else {
        searchQuery.query.bool.must.push({ match_all: {} })
      }

      // Add filters
      if (filters.gameSystem?.length) {
        searchQuery.query.bool.filter.push({
          terms: { gameSystem: filters.gameSystem }
        })
      }

      if (filters.difficulty?.length) {
        searchQuery.query.bool.filter.push({
          terms: { difficulty: filters.difficulty }
        })
      }

      if (filters.language?.length) {
        searchQuery.query.bool.filter.push({
          terms: { language: filters.language }
        })
      }

      if (filters.city?.length) {
        searchQuery.query.bool.filter.push({
          terms: { city: filters.city }
        })
      }

      if (filters.isOnline !== undefined) {
        searchQuery.query.bool.filter.push({
          term: { isOnline: filters.isOnline }
        })
      }

      // Add price range filter
      if (filters.priceRange) {
        const priceFilter: any = {}
        if (filters.priceRange.min !== undefined) {
          priceFilter.gte = filters.priceRange.min
        }
        if (filters.priceRange.max !== undefined) {
          priceFilter.lte = filters.priceRange.max
        }
        
        if (Object.keys(priceFilter).length > 0) {
          searchQuery.query.bool.filter.push({
            range: { pricePerSession: priceFilter }
          })
        }
      }

      // Add date range filter
      if (filters.dateRange) {
        const dateFilter: any = {}
        if (filters.dateRange.start) {
          dateFilter.gte = filters.dateRange.start
        }
        if (filters.dateRange.end) {
          dateFilter.lte = filters.dateRange.end
        }
        
        if (Object.keys(dateFilter).length > 0) {
          searchQuery.query.bool.filter.push({
            range: { startDate: dateFilter }
          })
        }
      }

      // Add geo distance filter
      if (filters.location) {
        searchQuery.query.bool.filter.push({
          geo_distance: {
            distance: filters.location.radius,
            location: {
              lat: filters.location.lat,
              lon: filters.location.lon
            }
          }
        })
      }

      const response = await this.client.search({
        index: this.indexName,
        ...searchQuery
      })

      const games = response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight
      }))

      // Handle different Elasticsearch versions for total count
      const total = typeof response.hits.total === 'object' 
        ? response.hits.total.value 
        : response.hits.total

      const totalCount = total ?? 0

      return {
        games,
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    } catch (error) {
      structuredLogger.error('Elasticsearch search error', error instanceof Error ? error : new Error('Unknown search error'), params)
      return this.fallbackSearch(params)
    }
  }

  async getSuggestions(query: string, limit = 5) {
    if (!this.client || !query) return []

    try {
      const response = await this.client.search({
        index: this.indexName,
        suggest: {
          game_suggest: {
            prefix: query,
            completion: {
              field: 'title.suggest',
              size: limit
            }
          }
        }
      })

      const suggestions = response.suggest?.game_suggest?.[0]?.options
      
      if (!Array.isArray(suggestions)) {
        return []
      }

      return suggestions.map((option: any) => ({
        text: option.text,
        score: option._score
      }))
    } catch (error) {
      structuredLogger.error('Elasticsearch suggestions error', error instanceof Error ? error : new Error('Unknown suggestions error'), { query })
      return []
    }
  }

  async getAggregations() {
    if (!this.client) return {}

    try {
      const response = await this.client.search({
        index: this.indexName,
        size: 0,
        aggs: {
          game_systems: {
            terms: { field: 'gameSystem', size: 50 }
          },
          difficulties: {
            terms: { field: 'difficulty', size: 10 }
          },
          languages: {
            terms: { field: 'language', size: 10 }
          },
          cities: {
            terms: { field: 'city', size: 100 }
          },
          price_stats: {
            stats: { field: 'pricePerSession' }
          }
        }
      })

      return response.aggregations || {}
    } catch (error) {
      structuredLogger.error('Elasticsearch aggregations error', error instanceof Error ? error : new Error('Unknown aggregations error'))
      return {}
    }
  }

  private buildSortQuery(sort: string) {
    switch (sort) {
      case 'date':
        return [{ startDate: { order: 'asc' } }]
      case 'price':
        return [
          { pricePerSession: { order: 'asc', missing: '_last' } },
          { _score: { order: 'desc' } }
        ]
      case 'rating':
        return [
          { gmRating: { order: 'desc' } },
          { gmIsVerified: { order: 'desc' } },
          { _score: { order: 'desc' } }
        ]
      case 'relevance':
      default:
        return [
          { _score: { order: 'desc' } },
          { startDate: { order: 'asc' } }
        ]
    }
  }

  private async fallbackSearch(params: any) {
    try {
      // Implement database fallback search with proper error handling
      const { QueryOptimizer } = await import('@/lib/performance/database-optimization')
      
      if (params.query && QueryOptimizer?.searchGames) {
        return await QueryOptimizer.searchGames(params.query, params.limit || 20)
      }
      
      // Return empty results if no fallback available
      return { 
        games: [], 
        total: 0, 
        page: params.page || 1, 
        limit: params.limit || 20, 
        pages: 0 
      }
    } catch (error) {
      structuredLogger.error('Fallback search error', error instanceof Error ? error : new Error('Unknown fallback search error'), params)
      return { 
        games: [], 
        total: 0, 
        page: params.page || 1, 
        limit: params.limit || 20, 
        pages: 0 
      }
    }
  }

  async deleteGame(gameId: string) {
    if (!this.client) return

    try {
      await this.client.delete({
        index: this.indexName,
        id: gameId
      })
      
      structuredLogger.info('Game deleted from search index', { gameId })
    } catch (error) {
      // Don't throw if document doesn't exist
      if (error && typeof error === 'object' && 'meta' in error) {
        const esError = error as { meta?: { statusCode?: number } }
        if (esError.meta?.statusCode === 404) {
          structuredLogger.warn('Game not found in search index for deletion', { gameId })
          return
        }
      }
      
      structuredLogger.error('Game deletion from search index error', error instanceof Error ? error : new Error('Unknown deletion error'), { gameId })
    }
  }

  async updateGame(gameId: string, updates: Partial<SearchableGame>) {
    if (!this.client) return

    try {
      await this.client.update({
        index: this.indexName,
        id: gameId,
        doc: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      })

      structuredLogger.info('Game updated in search index', { gameId })
    } catch (error) {
      structuredLogger.error('Game update in search index error', error instanceof Error ? error : new Error('Unknown update error'), { gameId })
    }
  }

  async bulkIndex(games: SearchableGame[]) {
    if (!this.client || games.length === 0) return

    try {
      const body = games.flatMap(game => [
        { index: { _index: this.indexName, _id: game.id } },
        {
          ...game,
          updatedAt: new Date().toISOString(),
          createdAt: game.createdAt || new Date().toISOString()
        }
      ])

      const response = await this.client.bulk({ body })

      if (response.errors) {
        const erroredDocuments = response.items.filter(item => 
          item.index?.error || item.create?.error || item.update?.error
        )
        structuredLogger.error('Bulk indexing errors', new Error('Bulk indexing failed'), { 
          errorCount: erroredDocuments.length,
          errors: erroredDocuments 
        })
      }

      structuredLogger.info('Bulk indexing completed', { 
        total: games.length,
        errors: response.errors ? 'some errors' : 'no errors'
      })
    } catch (error) {
      structuredLogger.error('Bulk indexing error', error instanceof Error ? error : new Error('Unknown bulk indexing error'), { gameCount: games.length })
    }
  }

  async healthCheck() {
    if (!this.client) return { status: 'disabled', message: 'Elasticsearch not configured' }

    try {
      const health = await this.client.cluster.health()
      const indexStats = await this.client.indices.stats({ index: this.indexName })
      
      return {
        status: 'healthy',
        cluster: health.status,
        indexExists: true,
        documentCount: indexStats.indices?.[this.indexName]?.total?.docs?.count || 0
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        status: 'error',
        message: errorMessage
      }
    }
  }
}

export const searchService = new SearchService()