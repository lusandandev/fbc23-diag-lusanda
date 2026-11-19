import { AppError } from '../errors';
import type { TaskRepository } from '../repositories/interfaces';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types/task';

export class TaskService {
  constructor(private readonly tasks: TaskRepository) {}

  list(userId: number, status?: TaskStatus): Promise<Task[]> {
    return this.tasks.findAllByUser(userId, status);
  }

  create(userId: number, input: CreateTaskInput): Promise<Task> {
    const normalized: CreateTaskInput = {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.due_date ?? null,
    };

    return this.tasks.create(userId, normalized);
  }

  async update(userId: number, taskId: number, input: UpdateTaskInput): Promise<void> {
    const normalized: UpdateTaskInput = {
      ...input,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
    };

    const updated = await this.tasks.update(userId, taskId, normalized);
    if (!updated) throw new AppError(404, 'Task not found.');
  }

  async delete(userId: number, taskId: number): Promise<void> {
    const deleted = await this.tasks.delete(userId, taskId);
    if (!deleted) throw new AppError(404, 'Task not found.');
  }
}
