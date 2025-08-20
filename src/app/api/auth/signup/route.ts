// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signUpSchema } from '@/lib/validations/auth'
import { createUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors/handler'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = signUpSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Некорректные данные',
            details: validationResult.error.flatten()
          } 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: { message: 'Пользователь с таким email уже существует' } },
        { status: 409 }
      )
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: data.username }
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: { message: 'Пользователь с таким именем уже существует' } },
        { status: 409 }
      )
    }

    // Create user
    const user = await createUser(data)

    logger.info(`New user registered: ${user.email}`)

    return NextResponse.json(
      {
        message: 'Пользователь успешно создан',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 201 }
    )

  } catch (error) {
    logger.error('Signup error:', error)
    return handleApiError(error)
  }
}
