import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import type { AppConfig } from '../config';

export type SqliteDatabase = Database<sqlite3.Database, sqlite3.Statement>;

export const openDatabase = async (config: AppConfig): Promise<SqliteDatabase> => {
  const db = await open({
    filename: config.databasePath,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  return db;
};
