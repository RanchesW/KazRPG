// ===== src/app/auth/signup/page.tsx =====
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function SignUpPage() {
  return (
    <div className="min-h-screen py-20 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Присоединиться к KazRPG
            </CardTitle>
            <p className="text-gray-400 text-center">
              Создайте аккаунт и начните играть
            </p>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Уже есть аккаунт?{' '}
                <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300">
                  Войти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}