import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export const getDb = async () => {
  if (db) return db;

  db = await open({
    filename: './dev.db',
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');

  // Initializes tables and a mock user to satisfy foreign key constraints
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('pending', 'completed')) NOT NULL DEFAULT 'pending',
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    INSERT OR IGNORE INTO users (id, email) VALUES (1, 'lusanda@example.com');
  `);

  console.log("Database initialized and schemas verified.");
  return db;
};