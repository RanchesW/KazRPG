// ===== src/lib/auth.ts =====
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { SignUpInput } from '@/app/validations/auth'

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