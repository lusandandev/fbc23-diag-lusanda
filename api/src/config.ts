import path from 'node:path';
import { existsSync } from 'node:fs';
import { z } from 'zod';

if (existsSync('.env')) process.loadEnvFile('.env');

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  JWT_SECRET: z.string({ error: 'JWT_SECRET is required. From the api folder, copy .env.example to .env and set a private secret.' })
    .min(1, 'JWT_SECRET must not be empty. Set it in api/.env.'),
  WEB_ORIGIN: z.string({ error: 'WEB_ORIGIN must be a valid URL.' }).url().default('http://localhost:3000'),
  DATABASE_PATH: z.string({ error: 'DATABASE_PATH must be a non-empty file path.' }).min(1).default('./dev.db'),
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  jwtSecret: string;
  webOrigin: string;
  databasePath: string;
};

export const loadConfig = (environment: NodeJS.ProcessEnv = process.env): AppConfig => {
  const parsed = EnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'configuration'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    jwtSecret: parsed.data.JWT_SECRET,
    webOrigin: parsed.data.WEB_ORIGIN,
    databasePath: path.resolve(parsed.data.DATABASE_PATH),
  };
};
