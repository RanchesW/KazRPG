'use client'

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ProfileFormProps {
  user: any;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    username: user?.username || '',
    bio: '',
    city: '',
    experience: 'BEGINNER',
    language: 'RU',
    isGM: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Профиль успешно обновлен');
      } else {
        toast.error('Ошибка при обновлении профиля');
      }
    } catch (error) {
      toast.error('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
            Имя
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Введите ваше имя"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
            Фамилия
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Введите вашу фамилию"
          />
        </div>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Имя пользователя
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Введите имя пользователя"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
          О себе
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Расскажите о себе и своих интересах в ролевых играх"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
            Город
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Выберите город</option>
            <option value="Алматы">Алматы</option>
            <option value="Астана">Астана</option>
            <option value="Шымкент">Шымкент</option>
            <option value="Караганда">Караганда</option>
            <option value="Актобе">Актобе</option>
            <option value="Тараз">Тараз</option>
            <option value="Павлодар">Павлодар</option>
            <option value="Усть-Каменогорск">Усть-Каменогорск</option>
            <option value="Семей">Семей</option>
            <option value="Атырау">Атырау</option>
            <option value="Костанай">Костанай</option>
            <option value="Кызылорда">Кызылорда</option>
            <option value="Уральск">Уральск</option>
            <option value="Петропавловск">Петропавловск</option>
            <option value="Актау">Актау</option>
          </select>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
            Опыт в РПГ
          </label>
          <select
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="BEGINNER">Новичок</option>
            <option value="INTERMEDIATE">Средний</option>
            <option value="ADVANCED">Продвинутый</option>
            <option value="EXPERT">Эксперт</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
            Предпочитаемый язык
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="RU">Русский</option>
            <option value="KK">Казахский</option>
            <option value="EN">English</option>
          </select>
        </div>

        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            id="isGM"
            name="isGM"
            checked={formData.isGM}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 bg-white/10 border border-white/20 rounded focus:ring-purple-500"
          />
          <label htmlFor="isGM" className="ml-2 text-sm text-gray-300">
            Я хочу быть мастером игры
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}