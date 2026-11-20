import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateTaskSchema,
  DueDateSchema,
  TaskFilterSchema,
  TaskIdSchema,
  UpdateTaskSchema,
} from '../src/schemas/task.schema';

test('task schemas validate input while leaving business-rule trimming to the service', () => {
  const result = CreateTaskSchema.parse({ title: '  Write tests  ', description: '  Cover the service  ' });
  assert.deepEqual(result, { title: '  Write tests  ', description: '  Cover the service  ' });
});

test('task creation rejects blank or overlong titles and overlong descriptions', () => {
  assert.equal(CreateTaskSchema.safeParse({ title: '   ' }).success, false);
  assert.equal(CreateTaskSchema.safeParse({ title: 'x'.repeat(256) }).success, false);
  assert.equal(CreateTaskSchema.safeParse({ title: 'Valid', description: 'x'.repeat(2001) }).success, false);
});

test('due-date validation accepts valid boundaries and rejects impossible or out-of-range dates', () => {
  assert.equal(DueDateSchema.safeParse('2028-02-29').success, true);
  assert.equal(DueDateSchema.safeParse('1900-01-01').success, true);
  assert.equal(DueDateSchema.safeParse('2100-12-31').success, true);
  assert.equal(DueDateSchema.safeParse('2026-02-30').success, false);
  assert.equal(DueDateSchema.safeParse('1899-12-31').success, false);
  assert.equal(DueDateSchema.safeParse('2101-01-01').success, false);
});

test('PATCH requires at least one valid field and provides a clear invalid-status message', () => {
  assert.equal(UpdateTaskSchema.safeParse({}).success, false);
  assert.equal(UpdateTaskSchema.safeParse({ status: 'completed' }).success, true);

  const invalidStatus = TaskFilterSchema.safeParse({ status: 'archived' });
  assert.equal(invalidStatus.success, false);
  if (!invalidStatus.success) {
    assert.match(invalidStatus.error.issues[0].message, /Status must be pending or completed/);
  }
});

test('task ID schema accepts positive integers and rejects decimals, zero and unsafe values', () => {
  assert.equal(TaskIdSchema.parse('12'), 12);
  assert.equal(TaskIdSchema.safeParse('1.5').success, false);
  assert.equal(TaskIdSchema.safeParse('0').success, false);
  assert.equal(TaskIdSchema.safeParse('9007199254740992').success, false);
});
