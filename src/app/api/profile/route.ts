import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        city: true,
        timezone: true,
        language: true,
        isGM: true,
        isVerified: true,
        experience: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      firstName,
      lastName,
      username,
      bio,
      city,
      experience,
      language,
      isGM
    } = data;

    // Check if username is already taken (if changing)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id: session.user.id
          }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Имя пользователя уже занято' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
        bio: bio || undefined,
        city: city || undefined,
        experience: experience || undefined,
        language: language || undefined,
        isGM: Boolean(isGM),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        city: true,
        timezone: true,
        language: true,
        isGM: true,
        isVerified: true,
        experience: true,
        rating: true,
        reviewCount: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Профиль успешно обновлен'
    });

  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении профиля' },
      { status: 500 }
    );
  }
}