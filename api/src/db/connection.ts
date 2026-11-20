import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import type { AppConfig } from '../config';

export type SqliteDatabase = Database<sqlite3.Database, sqlite3.Statement>;

// Opens a SQLite connection and enforces foreign key constraints
export const openDatabase = async (config: AppConfig): Promise<SqliteDatabase> => {
  const db = await open({
    filename: config.databasePath,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;'); // this is beecause sqlite turns this off by default
  return db;
};
