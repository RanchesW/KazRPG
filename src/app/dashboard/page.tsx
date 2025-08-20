import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const displayName = session.user?.name || session.user?.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Добро пожаловать, {displayName}! 🎲
                </h1>
                <p className="text-xl text-gray-300">
                  Готовы к новым приключениям?
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Статус</div>
                  <div className="text-green-400 font-semibold">🟢 Онлайн</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-lg p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Мои игры</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="text-purple-400 text-2xl">🎮</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Рейтинг</p>
                  <p className="text-3xl font-bold text-white">★ 0.0</p>
                </div>
                <div className="text-green-400 text-2xl">⭐</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-md rounded-lg p-6 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Сыграно</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="text-blue-400 text-2xl">🏆</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-md rounded-lg p-6 border border-orange-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium">Друзья</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="text-orange-400 text-2xl">👥</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <span className="mr-2">⚡</span>
                  Быстрые действия
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href="/games" 
                    className="flex items-center p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="text-2xl mr-3">🔍</span>
                    <div>
                      <div className="font-semibold">Найти игру</div>
                      <div className="text-sm opacity-90">Присоединиться к игре</div>
                    </div>
                  </a>
                  
                  <a 
                    href="/games/create" 
                    className="flex items-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="text-2xl mr-3">➕</span>
                    <div>
                      <div className="font-semibold">Создать игру</div>
                      <div className="text-sm opacity-90">Стать мастером</div>
                    </div>
                  </a>
                  
                  <a 
                    href="/profile" 
                    className="flex items-center p-4 bg-gradient-to-r from-gray-600 to-slate-600 rounded-lg text-white hover:from-gray-700 hover:to-slate-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="text-2xl mr-3">⚙️</span>
                    <div>
                      <div className="font-semibold">Настройки</div>
                      <div className="text-sm opacity-90">Редактировать профиль</div>
                    </div>
                  </a>
                  
                  <a 
                    href="/games" 
                    className="flex items-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="text-2xl mr-3">📚</span>
                    <div>
                      <div className="font-semibold">Библиотека</div>
                      <div className="text-sm opacity-90">Мои игры</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  Недавняя активность
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      👋
                    </div>
                    <div>
                      <p className="text-white font-medium">Добро пожаловать в KazRPG!</p>
                      <p className="text-gray-400 text-sm">Начните с создания профиля</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile & Info */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Профиль
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                      {displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{displayName}</p>
                      <p className="text-gray-400 text-sm">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Роль</p>
                        <p className="text-white">Игрок</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Опыт</p>
                        <p className="text-white">Новичок</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  Советы новичку
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">1.</span>
                    <p className="text-gray-200">Заполните свой профиль для лучшего поиска игр</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">2.</span>
                    <p className="text-gray-200">Начните с игр для новичков</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">3.</span>
                    <p className="text-gray-200">Не стесняйтесь задавать вопросы</p>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🔧</span>
                  Система
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Статус:</span>
                    <span className="text-green-400">🟢 Работает</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Версия:</span>
                    <span className="text-white">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Активных игр:</span>
                    <span className="text-white">42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
