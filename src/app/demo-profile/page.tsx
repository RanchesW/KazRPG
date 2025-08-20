import Link from 'next/link';

// Mock profile page for demonstration without auth
export default function MockProfilePage() {
  // Mock user data
  const mockUser = {
    name: 'Алексей Игроков',
    email: 'alex@example.com',
    id: 'demo-user',
    firstName: 'Алексей',
    lastName: 'Игроков',
    username: 'alexgamer',
    bio: 'Увлеченный игрок в настольные ролевые игры. Люблю D&D, Pathfinder и Call of Cthulhu. Опыт игры более 3 лет.',
    city: 'Алматы',
    experience: 'ADVANCED',
    language: 'RU',
    isGM: true,
    rating: 4.7,
    gamesPlayed: 12
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Настройки профиля
            </h1>
            <p className="text-gray-300">
              Управляйте своими личными данными и настройками аккаунта
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Основная информация
                </h2>
                
                {/* Mock Form */}
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Имя
                      </label>
                      <input
                        type="text"
                        value={mockUser.firstName}
                        readOnly
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Фамилия
                      </label>
                      <input
                        type="text"
                        value={mockUser.lastName}
                        readOnly
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      value={mockUser.username}
                      readOnly
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      О себе
                    </label>
                    <textarea
                      value={mockUser.bio}
                      readOnly
                      rows={4}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Город
                      </label>
                      <select
                        value={mockUser.city}
                        disabled
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Алматы">Алматы</option>
                        <option value="Астана">Астана</option>
                        <option value="Шымкент">Шымкент</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Опыт в РПГ
                      </label>
                      <select
                        value={mockUser.experience}
                        disabled
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="BEGINNER">Новичок</option>
                        <option value="INTERMEDIATE">Средний</option>
                        <option value="ADVANCED">Продвинутый</option>
                        <option value="EXPERT">Эксперт</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Предпочитаемый язык
                      </label>
                      <select
                        value={mockUser.language}
                        disabled
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="RU">Русский</option>
                        <option value="KK">Казахский</option>
                        <option value="EN">English</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        checked={mockUser.isGM}
                        disabled
                        className="w-4 h-4 text-purple-600 bg-white/10 border border-white/20 rounded focus:ring-purple-500"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Я хочу быть мастером игры
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Link
                      href="/demo-dashboard"
                      className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Назад к панели
                    </Link>
                    <button
                      type="button"
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Информация об аккаунте
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Email:</span>
                    <span className="text-white">{mockUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">ID:</span>
                    <span className="text-white text-xs">{mockUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Статус:</span>
                    <span className="text-green-400">Активен</span>
                  </div>
                </div>
              </div>

              {/* Gaming Stats */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Игровая статистика
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Игр сыграно:</span>
                    <span className="text-white">{mockUser.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Рейтинг:</span>
                    <span className="text-yellow-400">★ {mockUser.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Роль:</span>
                    <span className="text-purple-400">
                      {mockUser.isGM ? 'Игрок/ГМ' : 'Игрок'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Быстрые действия
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/demo-dashboard" 
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    Панель управления
                  </Link>
                  <Link 
                    href="/games" 
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    Просмотреть игры
                  </Link>
                  <Link 
                    href="/games/create" 
                    className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    Создать игру
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}