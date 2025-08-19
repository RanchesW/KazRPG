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