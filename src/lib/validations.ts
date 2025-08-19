// ===== src/lib/validations.ts =====
import { z } from "zod"

export const gameSchema = z.object({
  title: z.string().min(1, "Обязательное поле").max(100, "Максимум 100 символов"),
  description: z.string().min(10, "Минимум 10 символов").max(2000, "Максимум 2000 символов"),
  gameSystem: z.enum(['DND5E', 'PATHFINDER2E', 'CALL_OF_CTHULHU', 'VAMPIRE', 'SHADOWRUN', 'CYBERPUNK', 'WARHAMMER40K', 'OTHER']),
  platform: z.enum(['ROLL20', 'FOUNDRY', 'DISCORD', 'ZOOM', 'TELEGRAM', 'IN_PERSON', 'OTHER']).optional(),
  maxPlayers: z.number().min(1).max(8),
  pricePerSession: z.number().min(0).optional(),
  duration: z.number().min(30).max(480).optional(),
  difficulty: z.enum(['BEGINNER_FRIENDLY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT_ONLY']),
  isOnline: z.boolean(),
  city: z.string().optional(),
  address: z.string().optional(),
  startDate: z.date(),
  language: z.enum(['RU', 'KK', 'EN']).default('RU'),
  tags: z.array(z.string()).default([])
})

export type GameInput = z.infer<typeof gameSchema>