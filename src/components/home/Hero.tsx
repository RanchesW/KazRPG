// ===== src/components/home/Hero.tsx =====
import Link from 'next/link'
import { Dice6, Users, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative py-20 px-4 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
          KazRPG
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Найди игру в D&D, мастера или игроков по всему Казахстану. 
          Онлайн и оффлайн игры для всех уровней опыта.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Link href="/games" className="flex items-center gap-2">
              <Dice6 className="w-5 h-5" />
              Найти игру
            </Link>
          </Button>
          <Button size="lg" variant="outline">
            <Link href="/games/create" className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Создать игру
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-gray-400">Активных игр</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">200+</div>
            <div className="text-gray-400">Игроков</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">15+</div>
            <div className="text-gray-400">Мастеров</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
            <div className="text-gray-400">Городов</div>
          </div>
        </div>
      </div>
    </section>
  )
}