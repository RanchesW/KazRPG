import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { signInSchema } from '@/lib/validations/auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password } = signInSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              hashedPassword: true,
              isGM: true,
              isVerified: true,
              emailVerified: true,
              city: true,
              language: true,
            }
          })

          if (!user || !user.emailVerified) {
            return null
          }

          const isPasswordValid = await verifyPassword(
            password,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: `${user.firstName} ${user.lastName}`,
            image: user.avatar,
            isGM: user.isGM,
            isVerified: user.isVerified,
            city: user.city,
            language: user.language,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isGM = user.isGM
        token.isVerified = user.isVerified
        token.username = user.username
        token.city = user.city
        token.language = user.language
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.isGM = token.isGM as boolean
        session.user.isVerified = token.isVerified as boolean
        session.user.username = token.username as string
        session.user.city = token.city as string
        session.user.language = token.language as string
      }
      return session
    }
  }
}