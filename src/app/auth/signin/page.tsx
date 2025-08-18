// ===== src/app/auth/signin/page.tsx =====
import Link from 'next/link'
import { SignInForm } from '@/components/auth/SignInForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function SignInPage() {
  return (
    <div className="min-h-screen py-20 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Войти в KazRPG
            </CardTitle>
            <p className="text-gray-400 text-center">
              Добро пожаловать обратно!
            </p>
          </CardHeader>
          <CardContent>
            <SignInForm />
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Нет аккаунта?{' '}
                <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}