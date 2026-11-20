import type { Response } from 'express';
import { parseOrThrow } from '../errors';
import { authenticatedUserId, type AuthRequest } from '../middleware/auth';
import {
  CreateTaskSchema,
  TaskFilterSchema,
  TaskIdSchema,
  UpdateTaskSchema,
} from '../schemas/task.schema';
import { TaskService } from '../services/task.service';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  list = async (request: AuthRequest, response: Response): Promise<void> => {
    const filter = parseOrThrow(TaskFilterSchema, { status: request.query.status });
    const tasks = await this.taskService.list(authenticatedUserId(request), filter.status);
    response.status(200).json({ success: true, data: tasks });
  };

  create = async (request: AuthRequest, response: Response): Promise<void> => {
    const input = parseOrThrow(CreateTaskSchema, request.body);
    const task = await this.taskService.create(authenticatedUserId(request), input);
    response.status(201).json({ success: true, data: task });
  };

  update = async (request: AuthRequest, response: Response): Promise<void> => {
    const taskId = parseOrThrow(TaskIdSchema, request.params.id);
    const input = parseOrThrow(UpdateTaskSchema, request.body);

    await this.taskService.update(authenticatedUserId(request), taskId, input);
    response.status(200).json({ success: true, message: 'Task updated successfully' });
  };

  delete = async (request: AuthRequest, response: Response): Promise<void> => {
    const taskId = parseOrThrow(TaskIdSchema, request.params.id);
    await this.taskService.delete(authenticatedUserId(request), taskId);
    response.status(204).send();
  };
}
