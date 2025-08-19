// ===== src/types/next-auth.d.ts =====
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      username: string
      isGM: boolean
      isVerified: boolean
      city?: string | null
      language: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    username: string
    isGM: boolean
    isVerified: boolean
    city?: string | null
    language: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    isGM: boolean
    isVerified: boolean
    city?: string | null
    language: string
  }
}
