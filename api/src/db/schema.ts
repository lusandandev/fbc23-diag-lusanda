import type { SqliteDatabase } from './connection';

// Initializes tables and guards against incompatible legacy SQLite schemas
export const createSchema = async (db: SqliteDatabase): Promise<void> => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
      due_date TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Fail fast if an older `users` table lacks `password_hash` instead of silently breaking auth
  const userColumns = await db.all<{ name: string }[]>('PRAGMA table_info(users)');
  if (!userColumns.some((column) => column.name === 'password_hash')) {
    throw new Error(
      'The existing database uses an older schema. Delete api/dev.db once so the updated schema can be created.',
    );
  }

  // Ensure cascading user deletion is present on existing `tasks` tables
  const taskForeignKeys = await db.all<{ table: string; on_delete: string }[]>(
    'PRAGMA foreign_key_list(tasks)',
  );
  const userForeignKey = taskForeignKeys.find((foreignKey) => foreignKey.table === 'users');
  if (!userForeignKey || userForeignKey.on_delete.toUpperCase() !== 'CASCADE') {
    throw new Error(
      'The existing tasks table does not have ON DELETE CASCADE. Delete api/dev.db once so the updated schema can be created.',
    );
  }
};
