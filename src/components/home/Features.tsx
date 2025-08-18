// ===== src/components/home/Features.tsx =====
import { MapPin, Shield, Globe, Calendar, Star, Zap } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Местные игры',
    description: 'Найди игры в своем городе или играй онлайн с игроками из всего Казахстана'
  },
  {
    icon: Shield,
    title: 'Проверенные мастера',
    description: 'Все ГМы проходят верификацию, читай отзывы и выбирай лучших'
  },
  {
    icon: Globe,
    title: 'Мультиязычность',
    description: 'Игры на казахском, русском и английском языках'
  },
  {
    icon: Calendar,
    title: 'Удобное расписание',
    description: 'Найди игру в удобное время с учетом часовых поясов'
  },
  {
    icon: Star,
    title: 'Система рейтингов',
    description: 'Честные отзывы помогают выбрать идеального мастера'
  },
  {
    icon: Zap,
    title: 'Быстрый поиск',
    description: 'Умные фильтры помогут найти игру по всем параметрам'
  }
]

export function Features() {
  return (
    <section className="py-16 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Почему KazRPG?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card-gradient p-6 rounded-xl hover:border-purple-400/40 transition-colors"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}