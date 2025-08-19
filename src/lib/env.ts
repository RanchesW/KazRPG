// ===== src/lib/env.ts =====
import { z } from 'zod'

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // App configuration
  APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Email configuration
  FROM_EMAIL: z.string().email().default('noreply@kazrpg.kz'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Payment systems
  KAZKOM_MERCHANT_ID: z.string().optional(),
  KAZKOM_SECRET_KEY: z.string().optional(),
  KAZKOM_GATEWAY_URL: z.string().url().optional(),
  
  // External services
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  ELASTICSEARCH_URL: z.string().url().optional(),
  ELASTICSEARCH_USERNAME: z.string().optional(),
  ELASTICSEARCH_PASSWORD: z.string().optional(),
  
  // AWS/Cloud storage
  BACKUP_BUCKET_NAME: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
})

function createEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}

export const env = createEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>