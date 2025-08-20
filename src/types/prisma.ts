// ===== src/types/prisma.ts =====
// Temporary Prisma types until client can be properly generated

export namespace Prisma {
  export interface GameWhereInput {
    id?: string | StringFilter
    title?: string | StringFilter  
    description?: string | StringFilter
    gameSystem?: GameSystem | GameSystemFilter
    platform?: Platform | PlatformFilter
    maxPlayers?: number | IntFilter
    currentPlayers?: number | IntFilter
    pricePerSession?: number | IntFilter | null
    duration?: number | IntFilter | null
    difficulty?: Difficulty | DifficultyFilter
    tags?: string | StringFilter
    imageUrl?: string | StringFilter | null
    isOnline?: boolean | BoolFilter
    city?: string | StringFilter | null
    address?: string | StringFilter | null
    startDate?: Date | DateTimeFilter
    endDate?: Date | DateTimeFilter | null
    isRecurring?: boolean | BoolFilter
    language?: Language | LanguageFilter
    isActive?: boolean | BoolFilter
    gmId?: string | StringFilter
    createdAt?: Date | DateTimeFilter
    updatedAt?: Date | DateTimeFilter
    gm?: UserRelationFilter
    bookings?: BookingListRelationFilter
    reviews?: ReviewListRelationFilter
    OR?: GameWhereInput[]
    AND?: GameWhereInput[]
    NOT?: GameWhereInput | GameWhereInput[]
  }

  export interface StringFilter {
    equals?: string
    in?: string[]
    notIn?: string[]
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: string | StringFilter
  }

  export interface IntFilter {
    equals?: number
    in?: number[]
    notIn?: number[]
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: number | IntFilter
  }

  export interface BoolFilter {
    equals?: boolean
    not?: boolean | BoolFilter
  }

  export interface DateTimeFilter {
    equals?: Date
    in?: Date[]
    notIn?: Date[]
    lt?: Date
    lte?: Date
    gt?: Date
    gte?: Date
    not?: Date | DateTimeFilter
  }

  export interface GameSystemFilter {
    equals?: GameSystem
    in?: GameSystem[]
    notIn?: GameSystem[]
    not?: GameSystem | GameSystemFilter
  }

  export interface PlatformFilter {
    equals?: Platform
    in?: Platform[]
    notIn?: Platform[]
    not?: Platform | PlatformFilter
  }

  export interface DifficultyFilter {
    equals?: Difficulty
    in?: Difficulty[]
    notIn?: Difficulty[]
    not?: Difficulty | DifficultyFilter
  }

  export interface LanguageFilter {
    equals?: Language
    in?: Language[]
    notIn?: Language[]
    not?: Language | LanguageFilter
  }

  export interface UserRelationFilter {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export interface BookingListRelationFilter {
    every?: BookingWhereInput
    some?: BookingWhereInput
    none?: BookingWhereInput
  }

  export interface ReviewListRelationFilter {
    every?: ReviewWhereInput
    some?: ReviewWhereInput
    none?: ReviewWhereInput
  }

  export interface UserWhereInput {
    id?: string | StringFilter
    email?: string | StringFilter
    username?: string | StringFilter
    isGM?: boolean | BoolFilter
    isVerified?: boolean | BoolFilter
    // Add other fields as needed
  }

  export interface BookingWhereInput {
    id?: string | StringFilter
    status?: BookingStatus | BookingStatusFilter
    userId?: string | StringFilter
    gameId?: string | StringFilter
    // Add other fields as needed
  }

  export interface ReviewWhereInput {
    id?: string | StringFilter
    rating?: number | IntFilter
    authorId?: string | StringFilter
    targetId?: string | StringFilter
    gameId?: string | StringFilter
    // Add other fields as needed
  }

  export interface BookingStatusFilter {
    equals?: BookingStatus
    in?: BookingStatus[]
    notIn?: BookingStatus[]
    not?: BookingStatus | BookingStatusFilter
  }

  // Error classes from Prisma
  export class PrismaClientKnownRequestError extends Error {
    code: string
    clientVersion: string
    meta?: { target?: string[] }

    constructor(message: string, { code, clientVersion, meta }: { code: string; clientVersion: string; meta?: any }) {
      super(message)
      this.code = code
      this.clientVersion = clientVersion
      this.meta = meta
    }
  }

  export class PrismaClientUnknownRequestError extends Error {
    clientVersion: string
    
    constructor(message: string, { clientVersion }: { clientVersion: string }) {
      super(message)
      this.clientVersion = clientVersion
    }
  }

  export class PrismaClientRustPanicError extends Error {
    clientVersion: string
    
    constructor(message: string, { clientVersion }: { clientVersion: string }) {
      super(message)
      this.clientVersion = clientVersion
    }
  }

  export class PrismaClientInitializationError extends Error {
    clientVersion: string
    errorCode?: string
    
    constructor(message: string, { clientVersion, errorCode }: { clientVersion: string; errorCode?: string }) {
      super(message)
      this.clientVersion = clientVersion
      this.errorCode = errorCode
    }
  }

  export class PrismaClientValidationError extends Error {}
}

// Enums from schema
export type GameSystem = 'DND5E' | 'PATHFINDER2E' | 'CALL_OF_CTHULHU' | 'VAMPIRE' | 'SHADOWRUN' | 'CYBERPUNK' | 'WARHAMMER40K' | 'OTHER'
export type Platform = 'ROLL20' | 'FOUNDRY' | 'DISCORD' | 'ZOOM' | 'TELEGRAM' | 'IN_PERSON' | 'OTHER'
export type Difficulty = 'BEGINNER_FRIENDLY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT_ONLY'
export type Language = 'EN' | 'RU' | 'KK'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type Experience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'