// ===== src/components/layout/Footer.tsx =====
import Link from 'next/link'
import { Dice6, MapPin, Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Dice6 className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold gradient-text">KazRPG</span>
            </div>
            <p className="text-gray-400">
              Платформа №1 для поиска игр D&D и RPG в Казахстане
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Быстрые ссылки</h3>
            <div className="space-y-2">
              <Link href="/games" className="block text-gray-400 hover:text-white">
                Найти игру
              </Link>
              <Link href="/games/create" className="block text-gray-400 hover:text-white">
                Создать игру
              </Link>
              <Link href="/gms" className="block text-gray-400 hover:text-white">
                Стать мастером
              </Link>
            </div>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-white mb-4">Города</h3>
            <div className="space-y-2">
              <Link href="/games?city=almaty" className="block text-gray-400 hover:text-white">
                Алматы
              </Link>
              <Link href="/games?city=astana" className="block text-gray-400 hover:text-white">
                Астана
              </Link>
              <Link href="/games?city=shymkent" className="block text-gray-400 hover:text-white">
                Шымкент
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Контакты</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Алматы, Казахстан</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hello@kazrpg.kz</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+7 (777) 123-45-67</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 KazRPG. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}