import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, PlusSquare, Gamepad2 } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const cardClasses = "bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg transition-all hover:border-slate-500 hover:shadow-purple-500/10";
  const cardHeaderClasses = "p-4 border-b border-slate-700 flex items-center gap-3";
  const cardTitleClasses = "text-lg font-semibold text-slate-100";
  const cardContentClasses = "p-4 text-slate-300";
  const buttonClasses = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors";

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 pt-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-100">Панель управления</h1>
          <p className="text-slate-400 mt-2">
            Добро пожаловать, {session.user?.name || session.user?.email}!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <User className="w-6 h-6 text-purple-400" />
              <h2 className={cardTitleClasses}>Профиль</h2>
            </div>
            <div className={cardContentClasses}>
              <div className="space-y-2 text-sm">
                <p><strong className="font-medium text-slate-200">Email:</strong> {session.user?.email}</p>
                <p><strong className="font-medium text-slate-200">Имя:</strong> {session.user?.name}</p>
                <p><strong className="font-medium text-slate-200">ID:</strong> <span className="font-mono text-xs">{session.user?.id}</span></p>
              </div>
              <Link href="/profile" className={`${buttonClasses} bg-slate-700 hover:bg-slate-600 mt-4 w-full`}>
                <Settings className="w-4 h-4" />
                Настройки профиля
              </Link>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <Gamepad2 className="w-6 h-6 text-green-400" />
              <h2 className={cardTitleClasses}>Игры</h2>
            </div>
            <div className={`${cardContentClasses} flex flex-col gap-3`}>
              <Link href="/games" className={`${buttonClasses} bg-blue-600 hover:bg-blue-500 w-full`}>
                Просмотреть все игры
              </Link>
              <Link href="/games/create" className={`${buttonClasses} bg-green-600 hover:bg-green-500 w-full`}>
                <PlusSquare className="w-4 h-4" />
                Создать новую игру
              </Link>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h2 className={cardTitleClasses}>Недавняя активность</h2>
            </div>
            <div className={cardContentClasses}>
              <p className="text-slate-400 text-sm">Пока нет активности для отображения.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

