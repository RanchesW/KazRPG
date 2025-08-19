// src/components/games/GameList.tsx
'use client'

import { useInfiniteGames } from '@/hooks/useInfiniteGames'
import { GameCard } from './GameCard'
import { GameCardSkeleton } from '@/components/ui/Skeleton'
import { InfiniteScroll } from '@/components/ui/InfiniteScroll'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function GameList() {
  const searchParams = useSearchParams()
  
  const filters = useMemo(() => ({
    city: searchParams.get('city') || undefined,
    gameSystem: searchParams.get('gameSystem') || undefined,
    isOnline: searchParams.get('isOnline') === 'true' ? true : 
              searchParams.get('isOnline') === 'false' ? false : undefined,
    language: searchParams.get('language') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams])

  const {
    data: games,
    loading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refresh,
  } = useInfiniteGames(filters)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Ошибка загрузки игр: {error}</p>
        <button 
          onClick={refresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  if (loading && games.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <GameCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">
          Игры не найдены
        </p>
        <p className="text-gray-500">
          Попробуйте изменить фильтры поиска
        </p>
      </div>
    )
  }

  return (
    <InfiniteScroll
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      loader={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <GameCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </InfiniteScroll>
  )
}