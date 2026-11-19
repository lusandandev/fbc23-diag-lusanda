import { z } from 'zod';
import {
  CreateTaskSchema,
  TaskSchema,
  TaskStatusSchema,
  UpdateTaskSchema,
} from '../schemas/task.schema';

export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
