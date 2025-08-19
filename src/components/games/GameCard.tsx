// ===== src/components/games/GameCard.tsx =====
import Link from 'next/link'
import { Calendar, Users, MapPin, Star, Clock, DollarSign } from 'lucide-react'
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
    <div className={`card-gradient rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-purple-500/10 ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4">
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
            <span>{game.currentPlayers}/{game.maxPlayers} игроков</span>
            {spotsLeft <= 2 && spotsLeft > 0 && (
              <Badge variant="warning" className="text-xs ml-2">
                Осталось {spotsLeft}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{game.isOnline ? 'Онлайн' : game.city || 'Не указано'}</span>
          </div>
        </div>

        {/* Tags */}
        {game.tags && (() => {
          try {
            const parsedTags = JSON.parse(game.tags) as string[]
            return parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {parsedTags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {parsedTags.length > 3 && (
                  <span className="text-gray-500 text-xs px-2 py-1">
                    +{parsedTags.length - 3}
                  </span>
                )}
              </div>
            )
          } catch {
            return null
          }
        })()}

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {game.pricePerSession ? (
              <>
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold">
                  {formatPrice(game.pricePerSession)} ₸
                </span>
                <span className="text-gray-500 text-xs">/сессия</span>
              </>
            ) : (
              <span className="text-green-400 font-bold">Бесплатно</span>
            )}
          </div>

          <Link href={`/games/${game.id}`}>
            <Button 
              size="sm" 
              disabled={isFullyBooked}
              variant={isFullyBooked ? 'outline' : 'default'}
            >
              {isFullyBooked ? 'Мест нет' : 'Подробнее'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}