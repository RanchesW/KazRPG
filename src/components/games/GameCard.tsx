// ===== src/components/games/GameCard.tsx =====
import Link from 'next/link'
import { Calendar, Users, MapPin, Star, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPrice, getGameSystemLabel, getDifficultyLabel } from '@/lib/utils'

interface GameCardProps {
  game: {
    id: string
    title: string
    description: string
    gameSystem: string
    maxPlayers: number
    currentPlayers: number
    pricePerSession?: number | null
    startDate: Date
    isOnline: boolean
    city?: string | null
    language: string
    difficulty: string
    gm: {
      id: string
      username: string
      firstName: string
      lastName: string
      avatar?: string | null
      rating: number
      city?: string | null
      isVerified: boolean
    }
    tags?: string
  }
  className?: string
}

export function GameCard({ game, className = '' }: GameCardProps) {
  const spotsLeft = game.maxPlayers - game.currentPlayers
  const isFullyBooked = spotsLeft === 0

  return (
    <Link href={`/games/${game.id}`} className="block h-full">
      <div className={`card-gradient rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-purple-500/10 ${className} flex flex-col h-full`}>
        {/* Header */}
        <div className="p-6 pb-4 flex-grow">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="info" className="text-xs">
              {getGameSystemLabel(game.gameSystem)}
            </Badge>
            <Badge 
              variant={
                game.difficulty === 'BEGINNER_FRIENDLY' ? 'success' :
                game.difficulty === 'EXPERT_ONLY' ? 'danger' : 'warning'
              }
              className="text-xs"
            >
              {getDifficultyLabel(game.difficulty)}
            </Badge>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {game.title}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {game.description}
          </p>

          {/* GM Info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {game.gm.firstName.charAt(0)}{game.gm.lastName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">{game.gm.username}</p>
                {game.gm.isVerified && (
                  <Badge variant="success" className="text-xs">✓</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-yellow-400 text-sm">{game.gm.rating}</span>
                {game.gm.city && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">{game.gm.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(game.startDate)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              <span>{game.currentPlayers} / {game.maxPlayers} игроков</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{game.isOnline ? 'Онлайн' : game.city}</span>
            </div>
          </div>

          {/* Tags */}
          {game.tags && (
            <div className="flex flex-wrap gap-2">
              {JSON.parse(game.tags).slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="info">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-6 py-4 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-lg font-bold text-white">
                {game.pricePerSession ? formatPrice(game.pricePerSession) : 'Бесплатно'}
              </span>
            </div>
            <div 
              className={`text-sm font-bold ${isFullyBooked ? 'text-red-400' : 'text-green-400'}`}
            >
              {isFullyBooked ? 'Мест нет' : `Осталось: ${spotsLeft}`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}