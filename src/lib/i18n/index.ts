// ===== src/lib/i18n/index.ts =====
import { cache } from '@/lib/cache/redis'

type Language = 'ru' | 'kk' | 'en'
type TranslationKey = string
type TranslationValue = string | { [key: string]: TranslationValue }

interface Translations {
  [key: string]: TranslationValue
}

const translations: Record<Language, Translations> = {
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      search: 'Поиск',
      filter: 'Фильтр',
      next: 'Далее',
      previous: 'Назад',
      close: 'Закрыть',
      confirm: 'Подтвердить',
    },
    auth: {
      signin: 'Войти',
      signup: 'Регистрация',
      logout: 'Выйти',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      forgotPassword: 'Забыли пароль?',
      resetPassword: 'Сбросить пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      username: 'Имя пользователя',
      city: 'Город',
      language: 'Язык',
      isGM: 'Я мастер игр',
    },
    games: {
      title: 'Игры',
      createGame: 'Создать игру',
      gameTitle: 'Название игры',
      description: 'Описание',
      gameSystem: 'Игровая система',
      maxPlayers: 'Максимум игроков',
      difficulty: 'Сложность',
      isOnline: 'Онлайн игра',
      startDate: 'Дата начала',
      duration: 'Продолжительность',
      price: 'Цена за сессию',
      tags: 'Теги',
      noGamesFound: 'Игры не найдены',
      bookGame: 'Записаться',
      gameDetails: 'Подробности игры',
      gameBooked: 'Вы записались на игру',
    },
    profile: {
      profile: 'Профиль',
      editProfile: 'Редактировать профиль',
      myGames: 'Мои игры',
      myBookings: 'Мои записи',
      reviews: 'Отзывы',
      settings: 'Настройки',
      bio: 'О себе',
      experience: 'Опыт',
      rating: 'Рейтинг',
      verified: 'Верифицированный',
    },
    dashboard: {
      dashboard: 'Панель управления',
      overview: 'Обзор',
      analytics: 'Аналитика',
      users: 'Пользователи',
      games: 'Игры',
      bookings: 'Записи',
      payments: 'Платежи',
      content: 'Контент',
      settings: 'Настройки',
    },
  },
  kk: {
    common: {
      loading: 'Жүктелуде...',
      error: 'Қате',
      success: 'Сәтті',
      save: 'Сақтау',
      cancel: 'Болдырмау',
      delete: 'Жою',
      edit: 'Өңдеу',
      create: 'Құру',
      search: 'Іздеу',
      filter: 'Сүзгі',
      next: 'Келесі',
      previous: 'Алдыңғы',
      close: 'Жабу',
      confirm: 'Растау',
    },
    auth: {
      signin: 'Кіру',
      signup: 'Тіркеу',
      logout: 'Шығу',
      email: 'Email',
      password: 'Құпия сөз',
      confirmPassword: 'Құпия сөзді растау',
      forgotPassword: 'Құпия сөзді ұмыттыңыз ба?',
      resetPassword: 'Құпия сөзді қалпына келтіру',
      firstName: 'Аты',
      lastName: 'Тегі',
      username: 'Пайдаланушы аты',
      city: 'Қала',
      language: 'Тіл',
      isGM: 'Мен ойын шебері мін',
    },
    // Add more Kazakh translations...
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
    },
    auth: {
      signin: 'Sign In',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      username: 'Username',
      city: 'City',
      language: 'Language',
      isGM: 'I am a Game Master',
    },
    // Add more English translations...
  },
}

export class I18nService {
  private static currentLanguage: Language = 'ru'

  static setLanguage(language: Language) {
    this.currentLanguage = language
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazrpg-language', language)
      document.documentElement.lang = language
    }
  }

  static getLanguage(): Language {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kazrpg-language') as Language
      if (stored && ['ru', 'kk', 'en'].includes(stored)) {
        return stored
      }
    }
    return this.currentLanguage
  }

  static t(key: TranslationKey, params?: Record<string, string>): string {
    const keys = key.split('.')
    let value: any = translations[this.getLanguage()]

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    if (typeof value !== 'string') {
      // Fallback to Russian if translation not found
      value = translations.ru
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }
    }

    if (typeof value !== 'string') {
      return key // Return key if no translation found
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
    }

    return value
  }

  static async loadTranslations(language: Language, namespace?: string) {
    const cacheKey = `i18n:${language}:${namespace || 'default'}`
    
    // Try cache first
    const cached = await cache.get<Translations>(cacheKey)
    if (cached) {
      translations[language] = { ...translations[language], ...cached }
      return
    }

    try {
      // In a real implementation, you might load from API or files
      const response = await fetch(`/api/i18n/${language}${namespace ? `/${namespace}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        translations[language] = { ...translations[language], ...data }
        
        // Cache for 1 hour
        await cache.set(cacheKey, data, 3600)
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
    }
  }

  static getAvailableLanguages() {
    return [
      { code: 'ru', name: 'Русский', nativeName: 'Русский' },
      { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
      { code: 'en', name: 'English', nativeName: 'English' },
    ]
  }
}

// React hook for translations
export function useTranslation() {
  const t = (key: TranslationKey, params?: Record<string, string>) => {
    return I18nService.t(key, params)
  }

  const setLanguage = (language: Language) => {
    I18nService.setLanguage(language)
    // Force re-render by updating state or using context
  }

  return {
    t,
    setLanguage,
    currentLanguage: I18nService.getLanguage(),
    availableLanguages: I18nService.getAvailableLanguages(),
  }
}