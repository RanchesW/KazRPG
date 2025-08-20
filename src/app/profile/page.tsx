import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/config';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

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
                <ProfileForm user={session.user} />
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
                    <span className="text-white">{session.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">ID:</span>
                    <span className="text-white text-xs">{session.user?.id}</span>
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
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Рейтинг:</span>
                    <span className="text-yellow-400">★ 0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Роль:</span>
                    <span className="text-purple-400">Игрок</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Быстрые действия
                </h3>
                <div className="space-y-3">
                  <a 
                    href="/dashboard" 
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    Панель управления
                  </a>
                  <a 
                    href="/games" 
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    Просмотреть игры
                  </a>
                  <a 
                    href="/games/create" 
                    className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    Создать игру
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}