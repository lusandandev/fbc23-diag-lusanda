import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateTaskSchema,
  DueDateSchema,
  UpdateTaskSchema,
} from '../src/schemas/task.schema';

test('task schemas validate and normalize the task title and description', () => {
  const result = CreateTaskSchema.parse({ title: '  Write tests  ', description: '  Cover the service  ' });
  assert.deepEqual(result, { title: 'Write tests', description: 'Cover the service' });
});

test('task creation rejects an empty or whitespace-only title', () => {
  assert.equal(CreateTaskSchema.safeParse({ title: '   ' }).success, false);
});

test('task creation rejects a title longer than 255 characters', () => {
  assert.equal(CreateTaskSchema.safeParse({ title: 'x'.repeat(256) }).success, false);
});

test('task creation rejects a description longer than 2,000 characters', () => {
  assert.equal(CreateTaskSchema.safeParse({ title: 'Valid', description: 'x'.repeat(2001) }).success, false);
});

test('due-date validation accepts a real leap day and both range boundaries', () => {
  assert.equal(DueDateSchema.safeParse('2028-02-29').success, true);
  assert.equal(DueDateSchema.safeParse('1900-01-01').success, true);
  assert.equal(DueDateSchema.safeParse('2100-12-31').success, true);
});

test('due-date validation rejects impossible dates and dates outside the agreed range', () => {
  assert.equal(DueDateSchema.safeParse('2026-02-30').success, false);
  assert.equal(DueDateSchema.safeParse('1899-12-31').success, false);
  assert.equal(DueDateSchema.safeParse('2101-01-01').success, false);
});

test('PATCH validation requires at least one field', () => {
  assert.equal(UpdateTaskSchema.safeParse({}).success, false);
});

test('PATCH validation accepts a status-only change', () => {
  assert.equal(UpdateTaskSchema.safeParse({ status: 'completed' }).success, true);
});
