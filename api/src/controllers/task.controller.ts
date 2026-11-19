import type { Response } from 'express';
import { z } from 'zod';
import { AppError, validationError } from '../errors';
import { authenticatedUserId, type AuthRequest } from '../middleware/auth';
import {
  CreateTaskSchema,
  TaskFilterSchema,
  UpdateTaskSchema,
} from '../schemas/task.schema';
import { TaskService } from '../services/task.service';

const TaskIdSchema = z.string()
  .regex(/^[1-9]\d*$/, 'Task id must be a positive integer')
  .transform(Number)
  .refine(Number.isSafeInteger, 'Task id must be a safe positive integer');

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  list = async (request: AuthRequest, response: Response): Promise<void> => {
    const filter = TaskFilterSchema.safeParse({ status: request.query.status });
    if (!filter.success) throw validationError(filter.error);

    const tasks = await this.taskService.list(authenticatedUserId(request), filter.data.status);
    response.status(200).json({ success: true, data: tasks });
  };

  create = async (request: AuthRequest, response: Response): Promise<void> => {
    const parsed = CreateTaskSchema.safeParse(request.body);
    if (!parsed.success) throw validationError(parsed.error);

    const task = await this.taskService.create(authenticatedUserId(request), parsed.data);
    response.status(201).json({ success: true, data: task });
  };

  update = async (request: AuthRequest, response: Response): Promise<void> => {
    const parsedId = TaskIdSchema.safeParse(request.params.id);
    if (!parsedId.success) throw new AppError(400, 'Task id must be a positive integer');

    const parsedBody = UpdateTaskSchema.safeParse(request.body);
    if (!parsedBody.success) throw validationError(parsedBody.error);

    await this.taskService.update(
      authenticatedUserId(request),
      parsedId.data,
      parsedBody.data,
    );

    response.status(200).json({ success: true, message: 'Task updated successfully' });
  };

  delete = async (request: AuthRequest, response: Response): Promise<void> => {
    const parsedId = TaskIdSchema.safeParse(request.params.id);
    if (!parsedId.success) throw new AppError(400, 'Task id must be a positive integer');

    await this.taskService.delete(authenticatedUserId(request), parsedId.data);
    response.status(204).send();
  };
}
