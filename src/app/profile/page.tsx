// src/app/profile/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/config';
import { redirect } from 'next/navigation';
import { User, Settings, ShieldCheck } from 'lucide-react';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 flex items-center gap-4">
          <User className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-100">Профиль пользователя</h1>
            <p className="text-slate-400 mt-1">Управляйте настройками своего аккаунта</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-xl border border-slate-700 shadow-lg">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-12 h-12 text-slate-400" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{session.user?.name}</h2>
                <p className="text-slate-400">{session.user?.email}</p>
                <span className="inline-flex items-center gap-2 mt-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Verified User
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">Основная информация</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p><strong className="font-medium text-slate-400">Имя:</strong> {session.user?.name}</p>
                  <p><strong className="font-medium text-slate-400">Email:</strong> {session.user?.email}</p>
                  <p><strong className="font-medium text-slate-400">ID пользователя:</strong> <span className="font-mono text-xs">{session.user?.id}</span></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">Настройки аккаунта</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                   <button className="w-full sm:w-auto flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Изменить пароль
                  </button>
                  <button className="w-full sm:w-auto flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Удалить аккаунт
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
