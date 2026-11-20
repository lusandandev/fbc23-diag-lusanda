import type { SqliteDatabase } from '../db/connection';
import type { TaskRepository } from './interfaces';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types/task';

type TaskRow = Task;

export class SqliteTaskRepository implements TaskRepository {
  constructor(private readonly db: SqliteDatabase) {}

  async findAllByUser(userId: number, status?: TaskStatus): Promise<Task[]> {
    const columns = 'id, title, description, status, due_date, created_at';

    if (status) {
      return this.db.all<TaskRow[]>(
        `SELECT ${columns} FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC, id DESC`,
        [userId, status],
      );
    }

    return this.db.all<TaskRow[]>(
      `SELECT ${columns} FROM tasks WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
      [userId],
    );
  }

  async create(userId: number, input: CreateTaskInput): Promise<Task> {
    const result = await this.db.run(
      `INSERT INTO tasks (user_id, title, description, due_date)
       VALUES (?, ?, ?, ?)`,
      [userId, input.title, input.description ?? null, input.due_date ?? null],
    );

    const task = await this.db.get<TaskRow>(
      `SELECT id, title, description, status, due_date, created_at
       FROM tasks WHERE id = ? AND user_id = ?`,
      [result.lastID, userId],
    );

    if (!task) throw new Error('Created task could not be loaded from the database.');
    return task;
  }

  async update(userId: number, taskId: number, input: UpdateTaskInput): Promise<boolean> {
    const assignments: string[] = [];
    const values: Array<string | number | null> = [];

    if (input.title !== undefined) {
      assignments.push('title = ?');
      values.push(input.title);
    }
    if (input.description !== undefined) {
      assignments.push('description = ?');
      values.push(input.description);
    }
    if (input.status !== undefined) {
      assignments.push('status = ?');
      values.push(input.status);
    }
    if (input.due_date !== undefined) {
      assignments.push('due_date = ?');
      values.push(input.due_date);
    }

    values.push(taskId, userId);
    const result = await this.db.run(
      `UPDATE tasks SET ${assignments.join(', ')} WHERE id = ? AND user_id = ?`,
      values,
    );

    return (result.changes ?? 0) > 0;
  }

  async delete(userId: number, taskId: number): Promise<boolean> {
    const result = await this.db.run(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId],
    );

    return (result.changes ?? 0) > 0;
  }
}
