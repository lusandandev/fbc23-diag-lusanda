import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string({ error: 'Email is required and must be a string' }).trim().min(1, 'Email is required'),
  password: z.string({ error: 'Password is required and must be a string' }).min(1, 'Password is required'),
}, { error: 'Login body must be a JSON object' });
