// ===== src/lib/validations/auth.ts =====
import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  username: z.string()
    .min(3, 'Имя пользователя должно быть не менее 3 символов')
    .max(20, 'Имя пользователя должно быть не более 20 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Имя пользователя может содержать только буквы, цифры и подчеркивания'),
  firstName: z.string()
    .min(2, 'Имя должно быть не менее 2 символов')
    .max(30, 'Имя должно быть не более 30 символов'),
  lastName: z.string()
    .min(2, 'Фамилия должна быть не менее 2 символов')
    .max(30, 'Фамилия должна быть не более 30 символов'),
  password: z.string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру'),
  confirmPassword: z.string(),
  city: z.string().optional(),
  isGM: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export const signInSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(1, 'Пароль обязателен'),
})

export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>
