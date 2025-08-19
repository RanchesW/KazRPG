// ===== src/components/home/FeaturedGames.tsx =====
import Link from 'next/link'
import { GameCard } from '@/components/games/GameCard'
import { Button } from '@/components/ui/Button'

// Моковые данные для демонстрации
const mockGames = [
  {
    id: '1',
    title: 'Приключения в Забытых Королевствах',
    description: 'Эпическая кампания D&D 5e для начинающих игроков. Исследуйте мир полный магии и приключений!',
    gameSystem: 'DND5E' as const,
    maxPlayers: 5,
    currentPlayers: 3,
    pricePerSession: 2000,
    startDate: new Date('2024-12-01'),
    isOnline: true,
    language: 'RU' as const,
    difficulty: 'BEGINNER_FRIENDLY' as const,
    gm: {
      id: '1',
      username: 'DM_Artem',
      firstName: 'Артем',
      lastName: 'Смирнов',
      avatar: null,
      rating: 4.8,
      city: 'Алматы',
      isVerified: true
    },
    tags: JSON.stringify(['Новичкам', 'Ролевая игра', 'Онлайн'])
  },
  {
    id: '2', 
    title: 'Зов Ктулху: Тайны Алматы',
    description: 'Хоррор-расследование в современном Казахстане. Раскройте древние тайны, скрытые в сердце Алматы.',
    gameSystem: 'CALL_OF_CTHULHU' as const,
    maxPlayers: 4,
    currentPlayers: 2,
    pricePerSession: 2500,
    startDate: new Date('2024-11-25'),
    isOnline: false,
    city: 'Алматы',
    language: 'RU' as const,
    difficulty: 'INTERMEDIATE' as const,
    gm: {
      id: '2',
      username: 'MasterEldar',
      firstName: 'Эльдар',
      lastName: 'Назарбаев',
      avatar: null,
      rating: 4.9,
      city: 'Алматы',
      isVerified: true
    },
    tags: JSON.stringify(['Хоррор', 'Расследование', 'Казахстан'])
  }
]

export async function FeaturedGames() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Рекомендуемые игры
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            <Link href="/games">Посмотреть все игры</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}