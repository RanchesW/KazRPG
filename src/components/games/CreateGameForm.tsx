// ===== src/components/games/CreateGameForm.tsx =====
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function CreateGameForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gameSystem: 'DND5E',
    platform: 'ROLL20',
    maxPlayers: 4,
    pricePerSession: '',
    duration: '',
    difficulty: 'BEGINNER_FRIENDLY',
    tags: '',
    isOnline: true,
    city: '',
    address: '',
    startDate: '',
    language: 'RU',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerSession: formData.pricePerSession ? parseInt(formData.pricePerSession) : null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          startDate: new Date(formData.startDate).toISOString(),
        }),
      })

      if (response.ok) {
        router.push('/games')
      } else {
        throw new Error('Failed to create game')
      }
    } catch (error) {
      console.error('Error creating game:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Название игры
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Введите название игры"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Опишите вашу игру"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="gameSystem" className="block text-sm font-medium text-gray-700 mb-1">
            Игровая система
          </label>
          <select
            id="gameSystem"
            name="gameSystem"
            value={formData.gameSystem}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="DND5E">D&D 5E</option>
            <option value="PATHFINDER2E">Pathfinder 2E</option>
            <option value="CALL_OF_CTHULHU">Call of Cthulhu</option>
            <option value="VAMPIRE">Vampire</option>
            <option value="SHADOWRUN">Shadowrun</option>
            <option value="CYBERPUNK">Cyberpunk</option>
            <option value="WARHAMMER40K">Warhammer 40K</option>
            <option value="OTHER">Другое</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-1">
            Максимум игроков
          </label>
          <Input
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            value={formData.maxPlayers}
            onChange={handleChange}
            min="1"
            max="10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pricePerSession" className="block text-sm font-medium text-gray-700 mb-1">
            Цена за сессию (тенге)
          </label>
          <Input
            id="pricePerSession"
            name="pricePerSession"
            type="number"
            value={formData.pricePerSession}
            onChange={handleChange}
            placeholder="Оставьте пустым для бесплатной игры"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Длительность (минуты)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            placeholder="180"
          />
        </div>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
          Дата и время начала
        </label>
        <Input
          id="startDate"
          name="startDate"
          type="datetime-local"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex items-center">
        <input
          id="isOnline"
          name="isOnline"
          type="checkbox"
          checked={formData.isOnline}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-700">
          Онлайн игра
        </label>
      </div>

      {!formData.isOnline && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Город
            </label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Алматы"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Адрес
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Адрес проведения игры"
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          'Создать игру'
        )}
      </Button>
    </form>
  )
}
