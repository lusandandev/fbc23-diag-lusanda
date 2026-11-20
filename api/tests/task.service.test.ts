import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../src/errors';
import { TaskService } from '../src/services/task.service';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../src/types/task';
import type { TaskRepository } from '../src/repositories/interfaces';

const sampleTask: Task = {
  id: 1,
  title: 'Read the requirements',
  description: null,
  status: 'pending',
  due_date: null,
  created_at: '2026-11-19 10:00:00',
};

const createRepository = () => {
  const calls: {
    list?: [number, TaskStatus?];
    create?: [number, CreateTaskInput];
    update?: [number, number, UpdateTaskInput];
    delete?: [number, number];
  } = {};
  let updateResult = true;
  let deleteResult = true;

  const repository: TaskRepository = {
    findAllByUser: async (userId, status) => {
      calls.list = [userId, status];
      return [sampleTask];
    },
    create: async (userId, input) => {
      calls.create = [userId, input];
      return sampleTask;
    },
    update: async (userId, taskId, input) => {
      calls.update = [userId, taskId, input];
      return updateResult;
    },
    delete: async (userId, taskId) => {
      calls.delete = [userId, taskId];
      return deleteResult;
    },
  };

  return {
    repository,
    calls,
    setUpdateResult: (value: boolean) => { updateResult = value; },
    setDeleteResult: (value: boolean) => { deleteResult = value; },
  };
};

test('task service scopes listing to the authenticated user and optional status', async () => {
  const fake = createRepository();
  const service = new TaskService(fake.repository);
  await service.list(7, 'completed');
  assert.deepEqual(fake.calls.list, [7, 'completed']);
});

test('task service trims creation input and supplies null optional values', async () => {
  const fake = createRepository();
  const service = new TaskService(fake.repository);
  await service.create(7, { title: '  New task  ', description: '  Details  ', due_date: undefined });
  assert.deepEqual(fake.calls.create, [7, { title: 'New task', description: 'Details', due_date: null }]);
});

test('task service handles partial updates and performs the one business-rule trim', async () => {
  const fake = createRepository();
  const service = new TaskService(fake.repository);

  await service.update(7, 12, { status: 'completed' });
  assert.deepEqual(fake.calls.update, [7, 12, { status: 'completed' }]);

  await service.update(7, 12, { title: '  Revised  ', description: '  Notes  ' });
  assert.deepEqual(fake.calls.update, [7, 12, { title: 'Revised', description: 'Notes' }]);
});

test('task service returns the same 404 for a missing/non-owned update or delete', async () => {
  const fake = createRepository();
  const service = new TaskService(fake.repository);

  fake.setUpdateResult(false);
  await assert.rejects(
    service.update(7, 99, { status: 'completed' }),
    (error: unknown) => error instanceof AppError && error.statusCode === 404 && error.message === 'Task not found.',
  );

  fake.setDeleteResult(true);
  await service.delete(7, 12);
  assert.deepEqual(fake.calls.delete, [7, 12]);

  fake.setDeleteResult(false);
  await assert.rejects(
    service.delete(7, 99),
    (error: unknown) => error instanceof AppError && error.statusCode === 404 && error.message === 'Task not found.',
  );
});
