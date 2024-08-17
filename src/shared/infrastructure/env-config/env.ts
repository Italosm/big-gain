import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
  STRIPE_SECRET: z.string(),
  STRIPE_ID_WEBHOOK: z.string(),
});

export const env = envSchema.parse(process.env);
