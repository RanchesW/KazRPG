// ===== src/app/games/create/page.tsx =====
import { CreateGameForm } from '@/components/games/CreateGameForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CreateGamePage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Создать новую игру
            </CardTitle>
            <p className="text-gray-400 text-center">
              Заполните информацию о вашей игре и найдите игроков
            </p>
          </CardHeader>
          <CardContent>
            <CreateGameForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}