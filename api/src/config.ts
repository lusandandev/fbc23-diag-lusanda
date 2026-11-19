import path from 'node:path';
import { existsSync } from 'node:fs';
import { z } from 'zod';

if (existsSync('.env')) process.loadEnvFile('.env');

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_PATH: z.string().min(1).default('./dev.db'),
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
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
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
