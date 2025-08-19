// ===== src/components/search/AdvancedSearchForm.tsx =====
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Search, Filter, X, MapPin, Calendar, DollarSign } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface SearchFilters {
  query: string
  gameSystem: string[]
  difficulty: string[]
  language: string[]
  city: string[]
  isOnline: boolean | null
  priceRange: { min: number | null; max: number | null }
  dateRange: { start: string; end: string }
}

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

const DIFFICULTIES = [
  { value: 'BEGINNER_FRIENDLY', label: 'Для новичков' },
  { value: 'INTERMEDIATE', label: 'Средний уровень' },
  { value: 'ADVANCED', label: 'Продвинутый' },
  { value: 'EXPERT_ONLY', label: 'Только эксперты' }
]

const LANGUAGES = [
  { value: 'RU', label: 'Русский' },
  { value: 'KK', label: 'Қазақша' },
  { value: 'EN', label: 'English' }
]

const CITIES = [
  { value: 'Алматы', label: 'Алматы' },
  { value: 'Астана', label: 'Астана' },
  { value: 'Шымкент', label: 'Шымкент' },
  { value: 'Актобе', label: 'Актобе' },
  { value: 'Тараз', label: 'Тараз' }
]

export function AdvancedSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get('search') || '',
    gameSystem: searchParams.getAll('gameSystem'),
    difficulty: searchParams.getAll('difficulty'),
    language: searchParams.getAll('language'),
    city: searchParams.getAll('city'),
    isOnline: searchParams.get('isOnline') === 'true' ? true : 
               searchParams.get('isOnline') === 'false' ? false : null,
    priceRange: {
      min: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : null,
      max: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null,
    },
    dateRange: {
      start: searchParams.get('startDate') || '',
      end: searchParams.get('endDate') || '',
    }
  }))

  const debouncedQuery = useDebounce(filters.query, 300)

  // Fetch suggestions when query changes
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }, [])

  // Fetch suggestions when debounced query changes
  useMemo(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery)
    }
  }, [debouncedQuery, fetchSuggestions])

  const updateURL = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams()

    if (newFilters.query) params.set('search', newFilters.query)
    newFilters.gameSystem.forEach(sys => params.append('gameSystem', sys))
    newFilters.difficulty.forEach(diff => params.append('difficulty', diff))
    newFilters.language.forEach(lang => params.append('language', lang))
    newFilters.city.forEach(city => params.append('city', city))
    
    if (newFilters.isOnline !== null) {
      params.set('isOnline', newFilters.isOnline.toString())
    }
    
    if (newFilters.priceRange.min !== null) {
      params.set('minPrice', newFilters.priceRange.min.toString())
    }
    
    if (newFilters.priceRange.max !== null) {
      params.set('maxPrice', newFilters.priceRange.max.toString())
    }
    
    if (newFilters.dateRange.start) {
      params.set('startDate', newFilters.dateRange.start)
    }
    
    if (newFilters.dateRange.end) {
      params.set('endDate', newFilters.dateRange.end)
    }

    router.push(`/games?${params.toString()}`)
  }, [router])

  const handleSearch = () => {
    updateURL(filters)
    setShowSuggestions(false)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Auto-search for some filters
    if (key !== 'query') {
      updateURL(newFilters)
    }
  }

  const clearFilters = () => {
    const newFilters: SearchFilters = {
      query: '',
      gameSystem: [],
      difficulty: [],
      language: [],
      city: [],
      isOnline: null,
      priceRange: { min: null, max: null },
      dateRange: { start: '', end: '' }
    }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.gameSystem.length) count++
    if (filters.difficulty.length) count++
    if (filters.language.length) count++
    if (filters.city.length) count++
    if (filters.isOnline !== null) count++
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    return count
  }, [filters])

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={filters.query}
              onChange={(e) => {
                handleFilterChange('query', e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Поиск игр, мастеров, систем..."
              className="pl-10 pr-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-sm"
                      onClick={() => {
                        handleFilterChange('query', suggestion)
                        handleSearch()
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
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
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Game Systems */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Игровые системы</h3>
              <div className="flex flex-wrap gap-2">
                {GAME_SYSTEMS.map((system) => (
                  <Badge
                    key={system.value}
                    variant={filters.gameSystem.includes(system.value) ? 'info' : 'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      const newSystems = filters.gameSystem.includes(system.value)
                        ? filters.gameSystem.filter(s => s !== system.value)
                        : [...filters.gameSystem, system.value]
                      handleFilterChange('gameSystem', newSystems)
                    }}
                  >
                    {system.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Online/Offline */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Формат игры</h3>
              <div className="flex gap-2">
                <Badge
                  variant={filters.isOnline === true ? 'info' : 'default'}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange('isOnline', filters.isOnline === true ? null : true)}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Онлайн
                </Badge>
                <Badge
                  variant={filters.isOnline === false ? 'info' : 'default'}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange('isOnline', filters.isOnline === false ? null : false)}
                >
                  Оффлайн
                </Badge>
              </div>
            </div>

            {/* Cities */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Города</h3>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <Badge
                    key={city.value}
                    variant={filters.city.includes(city.value) ? 'info' : 'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      const newCities = filters.city.includes(city.value)
                        ? filters.city.filter(c => c !== city.value)
                        : [...filters.city, city.value]
                      handleFilterChange('city', newCities)
                    }}
                  >
                    {city.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Цена за сессию (₸)
              </h3>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="От"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="w-24"
                />
                <span className="text-gray-400">—</span>
                <Input
                  type="number"
                  placeholder="До"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="w-24"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />
                Дата игры
              </h3>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })}
                  className="w-40"
                />
                <span className="text-gray-400">—</span>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })}
                  className="w-40"
                />
              </div>
            </div>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <span className="text-sm text-gray-400">
                  Активных фильтров: {activeFiltersCount}
                </span>
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Очистить все
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}