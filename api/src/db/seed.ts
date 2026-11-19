import bcrypt from 'bcryptjs';
import type { SqliteDatabase } from './connection';

const DEMO_PASSWORD = 'password123';
const DEMO_USERS = [
  'lusanda@example.com',
  'alex@example.com',
] as const;

export const seedDemoUsers = async (db: SqliteDatabase): Promise<void> => {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const email of DEMO_USERS) {
    await db.run(
      'INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash],
    );
  }
};
