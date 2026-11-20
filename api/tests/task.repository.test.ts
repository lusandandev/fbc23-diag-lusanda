import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SqliteDatabase } from '../src/db/connection';
import { SqliteTaskRepository } from '../src/repositories/sqlite-task.repository';

type RunCall = { sql: string; params: unknown[] };

const createFakeDatabase = (changes = 1) => {
  const runCalls: RunCall[] = [];
  const database = {
    all: async () => [],
    get: async () => undefined,
    run: async (sql: string, params: unknown[] = []) => {
      runCalls.push({ sql, params });
      return { changes, lastID: 1 };
    },
  } as unknown as SqliteDatabase;

  return { database, runCalls };
};

test('task update SQL always scopes the update by both task ID and user ID', async () => {
  const fake = createFakeDatabase(1);
  const repository = new SqliteTaskRepository(fake.database);

  const updated = await repository.update(7, 42, { status: 'completed' });

  assert.equal(updated, true);
  assert.match(fake.runCalls[0].sql, /WHERE id = \? AND user_id = \?/);
  assert.deepEqual(fake.runCalls[0].params, ['completed', 42, 7]);
});

test('task delete SQL always scopes deletion by both task ID and user ID', async () => {
  const fake = createFakeDatabase(0);
  const repository = new SqliteTaskRepository(fake.database);

  const deleted = await repository.delete(7, 42);

  assert.equal(deleted, false);
  assert.match(fake.runCalls[0].sql, /WHERE id = \? AND user_id = \?/);
  assert.deepEqual(fake.runCalls[0].params, [42, 7]);
});
