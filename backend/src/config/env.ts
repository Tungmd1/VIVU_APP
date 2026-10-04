import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/vivu_db'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('vivu_secret_jwt_key_2026_default_development_key'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Lỗi cấu hình biến môi trường (Environment Validation Error):', parsedEnv.error.format());
  process.exit(1);
}

export const ENV = parsedEnv.data;
