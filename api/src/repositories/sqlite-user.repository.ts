import type { SqliteDatabase } from '../db/connection';
import type { UserRecord, UserRepository } from './interfaces';

export class SqliteUserRepository implements UserRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return this.db.get<UserRecord>(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = ?',
      [email],
    );
  }
}
