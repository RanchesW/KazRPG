// src/app/games/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Calendar, Users, MapPin, Clock, DollarSign, Shield, Globe, BarChart } from 'lucide-react'
import { getGameSystemLabel, getDifficultyLabel, formatDate, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface GamePageProps {
  params: {
    id: string
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: {
      gm: true,
      bookings: true,
    },
  })

  if (!game) {
    notFound()
  }

  const spotsLeft = game.maxPlayers - game.bookings.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
            {/* Header Image */}
            {game.imageUrl && (
              <img src={game.imageUrl} alt={game.title} className="w-full h-64 object-cover" />
            )}

            <div className="p-6 sm:p-8">
              {/* Title and Badges */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="info">{getGameSystemLabel(game.gameSystem)}</Badge>
                  <Badge variant="warning">{getDifficultyLabel(game.difficulty)}</Badge>
                  <Badge variant={game.isOnline ? 'success' : 'default'}>
                    {game.isOnline ? 'Онлайн' : 'Оффлайн'}
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{game.title}</h1>
              </div>

              {/* Game Master Info */}
              <div className="mb-6 pb-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-slate-200 mb-3">Мастер Игры (GM)</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-2xl font-bold">
                    {game.gm.firstName.charAt(0)}{game.gm.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{game.gm.username}</p>
                    <p className="text-sm text-slate-400">{game.gm.city}</p>
                  </div>
                </div>
              </div>

              {/* Game Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-200">Дата и время</h3>
                    <p className="text-slate-300">{formatDate(game.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-200">Игроки</h3>
                    <p className="text-slate-300">{game.bookings.length} / {game.maxPlayers} (Осталось мест: {spotsLeft})</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-200">Местоположение</h3>
                    <p className="text-slate-300">{game.isOnline ? 'Онлайн' : `${game.city}, ${game.address}`}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-200">Стоимость</h3>
                    <p className="text-slate-300">{game.pricePerSession ? formatPrice(game.pricePerSession) : 'Бесплатно'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-200">Язык</h3>
                    <p className="text-slate-300">{game.language}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-200">Продолжительность</h3>
                    <p className="text-slate-300">{game.duration ? `${game.duration} минут` : 'Не указано'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-200 mb-3">Описание игры</h2>
                <p className="text-slate-300 whitespace-pre-wrap">{game.description}</p>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <Button size="lg" className="w-full sm:w-auto" disabled={spotsLeft <= 0}>
                  {spotsLeft > 0 ? 'Записаться на игру' : 'Нет мест'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
