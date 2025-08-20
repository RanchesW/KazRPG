// ===== src/app/games/page.tsx =====
import { Suspense } from 'react'
import { GameSearch } from '@/components/games/GameSearch'
import { GameList } from '@/components/games/GameList'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function GamesPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Найди свою идеальную игру
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Более 100 активных игр в Алматы, Астане и онлайн. 
            D&D, Pathfinder, Call of Cthulhu и многое другое.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        }>
          <GameSearch />
        </Suspense>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <GameList />
        </Suspense>
      </div>
    </div>
  )
}