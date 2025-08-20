// src/components/auth/SignUpForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { Eye, EyeOff } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    city: '',
    language: 'RU' as 'RU' | 'KK' | 'EN',
    isGM: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email обязателен'
    if (!formData.username) newErrors.username = 'Имя пользователя обязательно'
    if (formData.username.length < 3) newErrors.username = 'Минимум 3 символа'
    if (!formData.firstName) newErrors.firstName = 'Имя обязательно'
    if (!formData.lastName) newErrors.lastName = 'Фамилия обязательна'
    if (!formData.password) newErrors.password = 'Пароль обязателен'
    if (formData.password.length < 8) newErrors.password = 'Минимум 8 символов'
    if (formData.password && !/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну букву и одну цифру'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Аккаунт создан! Проверьте email для подтверждения.')
        router.push('/auth/signin')
      } else {
        toast.error(data.error?.message || 'Ошибка регистрации')
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Имя"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          error={errors.firstName}
          required
          disabled={loading}
        />
        <Input
          label="Фамилия"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          error={errors.lastName}
          required
          disabled={loading}
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
        disabled={loading}
      />

      <Input
        label="Имя пользователя"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        error={errors.username}
        placeholder="Только буквы, цифры и _"
        required
        disabled={loading}
      />

      <Input
        label="Город (необязательно)"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        placeholder="Алматы, Астана, Шымкент..."
        disabled={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="Минимум 8 символов, буквы и цифры"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Подтвердите пароль"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Язык</label>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value as 'RU' | 'KK' | 'EN' })}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
          disabled={loading}
        >
          <option value="RU">Русский</option>
          <option value="KK">Қазақша</option>
          <option value="EN">English</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isGM"
          checked={formData.isGM}
          onChange={(e) => setFormData({ ...formData, isGM: e.target.checked })}
          className="rounded border-slate-600 bg-slate-800 text-purple-600"
          disabled={loading}
        />
        <label htmlFor="isGM" className="text-sm text-gray-300">
          Я мастер игр (ГМ)
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
      </Button>
    </form>
  )
}