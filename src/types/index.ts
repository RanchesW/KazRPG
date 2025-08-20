// ===== src/types/index.ts =====
// Temporary types until Prisma client can be properly generated
export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  city?: string
  timezone: string
  language: 'EN' | 'RU' | 'KK'
  isGM: boolean
  isVerified: boolean
  experience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  rating: number
  reviewCount: number
  hashedPassword: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Game {
  id: string
  title: string
  description: string
  gameSystem: 'DND5E' | 'PATHFINDER2E' | 'CALL_OF_CTHULHU' | 'VAMPIRE' | 'SHADOWRUN' | 'CYBERPUNK' | 'WARHAMMER40K' | 'OTHER'
  platform?: 'ROLL20' | 'FOUNDRY' | 'DISCORD' | 'ZOOM' | 'TELEGRAM' | 'IN_PERSON' | 'OTHER'
  maxPlayers: number
  currentPlayers: number
  pricePerSession?: number
  duration?: number
  difficulty: 'BEGINNER_FRIENDLY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT_ONLY'
  tags: string
  imageUrl?: string
  isOnline: boolean
  city?: string
  address?: string
  startDate: Date
  endDate?: Date
  isRecurring: boolean
  language: 'EN' | 'RU' | 'KK'
  isActive: boolean
  gmId: string
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  playerCount: number
  message?: string
  totalPrice?: number
  userId: string
  gameId: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  rating: number
  comment?: string
  authorId: string
  targetId: string
  gameId: string
  createdAt: Date
}

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