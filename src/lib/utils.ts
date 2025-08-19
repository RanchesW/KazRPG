// ===== src/lib/utils.ts =====
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy, HH:mm", { locale: ru })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price)
}

export function getGameSystemLabel(system: string): string {
  const labels = {
    'DND5E': 'D&D 5e',
    'PATHFINDER2E': 'Pathfinder 2e', 
    'CALL_OF_CTHULHU': 'Зов Ктулху',
    'VAMPIRE': 'Вампир',
    'SHADOWRUN': 'Shadowrun',
    'CYBERPUNK': 'Cyberpunk',
    'WARHAMMER40K': 'Warhammer 40K',
    'OTHER': 'Другая система'
  }
  return labels[system as keyof typeof labels] || system
}

export function getDifficultyLabel(difficulty: string): string {
  const labels = {
    'BEGINNER_FRIENDLY': 'Для новичков',
    'INTERMEDIATE': 'Средний уровень',
    'ADVANCED': 'Продвинутый',
    'EXPERT_ONLY': 'Только эксперты'
  }
  return labels[difficulty as keyof typeof labels] || difficulty
}

export function getLanguageLabel(lang: string): string {
  const labels = {
    'RU': 'Русский',
    'KK': 'Қазақша', 
    'EN': 'English'
  }
  return labels[lang as keyof typeof labels] || lang
}