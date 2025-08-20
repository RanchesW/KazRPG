// ===== src/lib/auth.ts =====
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { SignUpData } from '@/lib/validations/auth'
import { createId } from '@paralleldrive/cuid2'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(data: SignUpData) {
  const hashedPassword = await hashPassword(data.password)
  
  return prisma.users.create({
    data: {
      id: createId(), // Manually generate CUID since SQLite doesn't auto-generate
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      city: data.city,
      language: data.language,
      isGM: data.isGM,
      hashedPassword,
      emailVerified: true, // Set to true for development - implement email verification later
      updatedAt: new Date(), // Required field according to the Prisma schema
    }
  })
}