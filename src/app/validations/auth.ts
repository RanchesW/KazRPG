import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
})

export const signUpSchema = z.object({
  email: z.string().email('Некорректный email'),
  username: z.string()
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и _'),
  firstName: z.string().min(1, 'Обязательное поле').max(50),
  lastName: z.string().min(1, 'Обязательное поле').max(50),
  password: z.string()
    .min(8, 'Минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Пароль должен содержать строчные, заглавные буквы и цифры'),
  confirmPassword: z.string(),
  city: z.string().optional(),
  language: z.enum(['RU', 'KK', 'EN']).default('RU'),
  isGM: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string()
    .min(8, 'Минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Пароль должен содержать строчные, заглавные буквы и цифры'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>