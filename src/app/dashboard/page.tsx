import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Добро пожаловать, {session.user?.name || session.user?.email}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Профиль</h2>
              <div className="space-y-2 text-gray-200">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Имя:</strong> {session.user?.name}</p>
                <p><strong>ID:</strong> {session.user?.id}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Быстрые действия</h2>
              <div className="space-y-3">
                <a 
                  href="/games" 
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
                >
                  Просмотреть игры
                </a>
                <a 
                  href="/games/create" 
                  className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
                >
                  Создать игру
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Недавняя активность</h2>
              <p className="text-gray-300">Пока нет активности</p>
            </div>
          </div>

          {/* Navigation to main sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Мои игры</h3>
              <p className="text-gray-300 mb-4">Управляйте своими ролевыми играми</p>
              <a 
                href="/games" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Перейти к играм
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Настройки</h3>
              <p className="text-gray-300 mb-4">Настройте свой профиль и предпочтения</p>
              <a 
                href="/profile" 
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Настройки профиля
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
