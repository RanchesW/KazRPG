// ===== src/lib/prisma.ts =====
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'], // Показывать SQL запросы в консоли для разработки
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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

// ===== src/lib/validations.ts =====
import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Некорректный email"),
  username: z.string()
    .min(3, "Минимум 3 символа")
    .max(20, "Максимум 20 символов")
    .regex(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и _"),
  firstName: z.string().min(1, "Обязательное поле"),
  lastName: z.string().min(1, "Обязательное поле"),
  password: z.string().min(6, "Минимум 6 символов"),
  city: z.string().optional(),
  language: z.enum(['RU', 'KK', 'EN']).default('RU')
})

export const gameSchema = z.object({
  title: z.string().min(1, "Обязательное поле").max(100, "Максимум 100 символов"),
  description: z.string().min(10, "Минимум 10 символов").max(2000, "Максимум 2000 символов"),
  gameSystem: z.enum(['DND5E', 'PATHFINDER2E', 'CALL_OF_CTHULHU', 'VAMPIRE', 'SHADOWRUN', 'CYBERPUNK', 'WARHAMMER40K', 'OTHER']),
  platform: z.enum(['ROLL20', 'FOUNDRY', 'DISCORD', 'ZOOM', 'TELEGRAM', 'IN_PERSON', 'OTHER']).optional(),
  maxPlayers: z.number().min(1).max(8),
  pricePerSession: z.number().min(0).optional(),
  duration: z.number().min(30).max(480).optional(),
  difficulty: z.enum(['BEGINNER_FRIENDLY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT_ONLY']),
  isOnline: z.boolean(),
  city: z.string().optional(),
  address: z.string().optional(),
  startDate: z.date(),
  language: z.enum(['RU', 'KK', 'EN']).default('RU'),
  tags: z.array(z.string()).default([])
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type GameInput = z.infer<typeof gameSchema>

// ===== src/lib/auth.ts =====
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(data: SignUpInput) {
  const hashedPassword = await hashPassword(data.password)
  
  return prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      city: data.city,
      language: data.language,
      hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      city: true,
      language: true,
      isGM: true,
      isVerified: true,
      rating: true,
      createdAt: true,
    }
  })
}

// ===== src/types/index.ts =====
import { Game, User, Booking, Review } from '@prisma/client'

export type GameWithGM = Game & {
  gm: Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'avatar' | 'rating' | 'city' | 'isVerified'>
  _count: {
    bookings: number
    reviews: number
  }
}

export type UserProfile = Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'avatar' | 'bio' | 'city' | 'isGM' | 'isVerified' | 'rating' | 'reviewCount' | 'language' | 'experience'>

export type BookingWithGame = Booking & {
  game: Game & {
    gm: Pick<User, 'username' | 'firstName' | 'lastName'>
  }
}

export type ReviewWithAuthor = Review & {
  author: Pick<User, 'username' | 'firstName' | 'lastName' | 'avatar'>
  game: Pick<Game, 'title'>
}