// ===== src/app/api/auth/signup/route.ts =====
import { NextRequest, NextResponse } from 'next/server'
import { signUpSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors/handler'
import { ConflictError } from '@/lib/errors/types'
import { sendVerificationEmail } from '@/lib/email'
import { nanoid } from 'nanoid'
import { withRateLimit } from '@/lib/api/middleware'

async function signupHandler(req: NextRequest) {
  const requestId = nanoid()

  try {
    const body = await req.json()
    const validatedData = signUpSchema.parse(body)

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      const field = existingUser.email === validatedData.email ? 'Email' : 'Username'
      throw new ConflictError(`${field} уже используется`)
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Generate verification token
    const verificationToken = nanoid(32)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        city: validatedData.city,
        language: validatedData.language,
        isGM: validatedData.isGM,
        hashedPassword,
        emailVerificationToken: verificationToken,
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
        createdAt: true,
      }
    })

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json(
      {
        message: 'Аккаунт создан. Проверьте email для подтверждения.',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export const POST = withRateLimit(signupHandler, { limit: 5, window: 60000 })