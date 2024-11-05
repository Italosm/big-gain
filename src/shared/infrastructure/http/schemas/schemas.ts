import { z } from 'zod';

export const createUserSchema = z.object({
  auth0_id: z.string(),
  status: z.coerce.boolean().default(true),
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  document: z.string(),
  phones: z.string(),
  nacionalidade: z.number().default(26),
  pinnacle_refusal: z.boolean(),
  avatar: z.string().url().optional(),
  birth_date: z.coerce.date(),
});

export const listUsersSchema = z.object({
  sortBy: z
    .enum(['name', 'email', 'document', 'birth_date', 'created_at'])
    .default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  has_pinnacle: z
    .string()
    .transform(val =>
      val === 'true' || val === 'false' ? val === 'true' : undefined,
    )
    .optional()
    .default(undefined),
  pinnacle_status: z
    .string()
    .transform(val =>
      val === 'true' || val === 'false' ? val === 'true' : undefined,
    )
    .optional()
    .default(undefined),
});

export const updateUserSchema = z.object({
  status: z.coerce.boolean().optional(),
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  document: z.string().optional(),
  phones: z.string().optional(),
  nacionalidade: z.number().optional(),
  pinnacle_refusal: z.boolean().optional(),
  avatar: z.string().url().optional(),
  birth_date: z.coerce.date().optional(),
});

export const createUserPinnacleSchema = z.object({
  pinnacle_id: z.string(),
  pinnacle_status: z.coerce.boolean().default(false),
  pinnacle_date: z.coerce.date().optional(),
  pinnacle_exp: z.coerce.date().optional(),
  comments: z.string().optional(),
});

export const updateUserPinnacleSchema = z.object({
  pinnacle_id: z.string().optional(),
  pinnacle_status: z.coerce.boolean().optional(),
  pinnacle_date: z.coerce.date().optional(),
  pinnacle_exp: z.coerce.date().optional(),
  comments: z.string().optional(),
});

export const createUserAddressSchema = z.object({
  address: z.string(),
  cep: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  number: z.string(),
  city: z.string(),
  state: z.string(),
});

export const updateUserAddressSchema = z.object({
  address: z.string().optional(),
  cep: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const createUserStripeSchema = z.object({
  user_id: z.number().int(),
  customer_id: z.string(),
  subscription_id: z.string().optional(),
  subscription_status: z.string(),
});

export const createSessionSchema = z.string();

export const auth0IdSchema = z.string();
