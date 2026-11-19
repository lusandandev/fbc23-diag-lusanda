import { z } from 'zod';

export const TaskStatusSchema = z.enum(['pending', 'completed']);

const isCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

export const DueDateSchema = z.string()
  .refine(isCalendarDate, 'Must be a real calendar date in YYYY-MM-DD format')
  .refine((value) => value >= '1900-01-01' && value <= '2100-12-31', 'Date must be between 1900-01-01 and 2100-12-31');

export const TaskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  status: TaskStatusSchema,
  due_date: DueDateSchema.nullable(),
  created_at: z.string(),
});

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
  description: z.string().trim().max(2000, 'Description must be at most 2,000 characters').nullable().optional(),
  due_date: DueDateSchema.nullable().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255, 'Title must be at most 255 characters').optional(),
  description: z.string().trim().max(2000, 'Description must be at most 2,000 characters').nullable().optional(),
  status: TaskStatusSchema.optional(),
  due_date: DueDateSchema.nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

export const TaskFilterSchema = z.object({
  status: TaskStatusSchema.optional(),
});
