// ===== src/hooks/useInfiniteGames.ts =====
'use client'

import { useCallback, useEffect, useState } from 'react'
import { GameWithGM } from '@/types'

interface GameFilters {
  city?: string
  gameSystem?: string
  isOnline?: boolean
  language?: string
  difficulty?: string
  search?: string
}

interface GamesResponse {
  games: GameWithGM[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useInfiniteGames(filters: GameFilters = {}) {
  const [data, setData] = useState<GameWithGM[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchGames = useCallback(
    async (page: number, isNewSearch = false) => {
      console.log('fetchGames called with page:', page, 'isNewSearch:', isNewSearch)
      setLoading(true)
      setError(null)

      try {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          ),
        })

        console.log('Fetching:', `/api/games?${searchParams}`)
        const response = await fetch(`/api/games?${searchParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch games')
        }

        const result: GamesResponse = await response.json()
        console.log('API result:', result)

        if (isNewSearch) {
          setData(result.games)
        } else {
          setData(prev => [...prev, ...result.games])
        }

        setHasNextPage(page < result.pagination.pages)
        setCurrentPage(page)
      } catch (err) {
        console.error('Error fetching games:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  const fetchNextPage = useCallback(() => {
    if (!loading && hasNextPage) {
      fetchGames(currentPage + 1)
    }
  }, [fetchGames, currentPage, hasNextPage, loading])

  const refresh = useCallback(() => {
    setCurrentPage(1)
    fetchGames(1, true)
  }, [fetchGames])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    data,
    loading,
    error,
    hasNextPage,
    fetchNextPage,
    refresh,
    isFetchingNextPage: loading && currentPage > 1,
  }
}