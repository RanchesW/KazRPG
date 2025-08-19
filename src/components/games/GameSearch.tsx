// src/components/games/GameSearch.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const GAME_SYSTEMS = [
  { value: 'DND5E', label: 'D&D 5e' },
  { value: 'PATHFINDER2E', label: 'Pathfinder 2e' },
  { value: 'CALL_OF_CTHULHU', label: 'Зов Ктулху' },
  { value: 'VAMPIRE', label: 'Вампир' },
  { value: 'SHADOWRUN', label: 'Shadowrun' },
  { value: 'CYBERPUNK', label: 'Cyberpunk' },
  { value: 'WARHAMMER40K', label: 'Warhammer 40K' },
  { value: 'OTHER', label: 'Другие' }
]

const CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Тараз'
]

const DIFFICULTIES = [
  { value: 'BEGINNER_FRIENDLY', label: 'Для новичков' },
  { value: 'INTERMEDIATE', label: 'Средний уровень' },
  { value: 'ADVANCED', label: 'Продвинутый' },
  { value: 'EXPERT_ONLY', label: 'Только эксперты' }
]

export function GameSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    gameSystem: searchParams.get('gameSystem') || '',
    city: searchParams.get('city') || '',
    difficulty: searchParams.get('difficulty') || '',
    isOnline: searchParams.get('isOnline') || ''
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    
    router.push(`/games?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      gameSystem: '',
      city: '',
      difficulty: '',
      isOnline: ''
    })
    router.push('/games')
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length - (filters.search ? 1 : 0)

  return (
    <div className="space-y-4 mb-8">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Поиск игр, мастеров, систем..."
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <Button onClick={handleSearch}>
          Найти
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <Badge variant="info" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="card-gradient rounded-xl p-6 space-y-4">
          {/* Game Systems */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Игровая система</h3>
            <select
              value={filters.gameSystem}
              onChange={(e) => setFilters({ ...filters, gameSystem: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">Все системы</option>
              {GAME_SYSTEMS.map((system) => (
                <option key={system.value} value={system.value}>
                  {system.label}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Город</h3>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">Все города</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Сложность</h3>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">Любая сложность</option>
              {DIFFICULTIES.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>

          {/* Online/Offline */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Формат</h3>
            <select
              value={filters.isOnline}
              onChange={(e) => setFilters({ ...filters, isOnline: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">Онлайн и оффлайн</option>
              <option value="true">Только онлайн</option>
              <option value="false">Только оффлайн</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSearch} className="flex-1">
              Применить фильтры
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={clearFilters}>
                Очистить
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}