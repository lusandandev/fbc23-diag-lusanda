
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

// Handles HTTP requests for CRUD operations
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Lists user tasks with optional status filtering 
  list = async (request: AuthRequest, response: Response): Promise<void> => {
    const filter = parseOrThrow(TaskFilterSchema, { status: request.query.status });
    const tasks = await this.taskService.list(authenticatedUserId(request), filter.status);
    response.status(200).json({ success: true, data: tasks });
  };

  // Creates a new task for the authenticated user
  create = async (request: AuthRequest, response: Response): Promise<void> => {
    const input = parseOrThrow(CreateTaskSchema, request.body);
    const task = await this.taskService.create(authenticatedUserId(request), input);
    response.status(201).json({ success: true, data: task });
  };

  // Updates an existing user-owned task by ID
  update = async (request: AuthRequest, response: Response): Promise<void> => {
    const taskId = parseOrThrow(TaskIdSchema, request.params.id);
    const input = parseOrThrow(UpdateTaskSchema, request.body);

    await this.taskService.update(authenticatedUserId(request), taskId, input);
    response.status(200).json({ success: true, message: 'Task updated successfully' });
  };

  // Deletes a user-owned task by ID
  delete = async (request: AuthRequest, response: Response): Promise<void> => {
    const taskId = parseOrThrow(TaskIdSchema, request.params.id);
    await this.taskService.delete(authenticatedUserId(request), taskId);
    response.status(204).send();
  };
}
