import { z } from 'zod';

export const TaskStatusSchema = z.enum(['pending', 'completed'], {
  error: 'Status must be pending or completed',
});

const isCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

export const DueDateSchema = z.string({
  error: 'Due date must be a string in YYYY-MM-DD format',
})
  .refine(isCalendarDate, 'Due date must be a real calendar date in YYYY-MM-DD format')
  .refine((value) => value >= '1900-01-01' && value <= '2100-12-31', 'Due date must be between 1900-01-01 and 2100-12-31');

export const TaskIdSchema = z.string({
  error: 'Task id must be a positive integer',
})
  .regex(/^[1-9]\d*$/, 'Task id must be a positive integer')
  .transform(Number)
  .refine(Number.isSafeInteger, 'Task id must be a safe positive integer');

export const TaskSchema = z.object({
  id: z.number({ error: 'Task id must be a number' }).int('Task id must be an integer').positive('Task id must be positive'),
  title: z.string({ error: 'Title must be a string' }).min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
  description: z.string({ error: 'Description must be a string or null' }).nullable(),
  status: TaskStatusSchema,
  due_date: DueDateSchema.nullable(),
  created_at: z.string({ error: 'Created date must be a string' }),
}, { error: 'Task must be a JSON object' });

// Trimming is a service-layer business rule. The schema rejects blank titles without transforming input.
const TitleInputSchema = z.string({ error: 'Title must be a string' })
  .refine((value) => value.trim().length > 0, 'Title is required')
  .refine((value) => value.trim().length <= 255, 'Title must be at most 255 characters');

const DescriptionInputSchema = z.string({ error: 'Description must be a string or null' })
  .refine((value) => value.trim().length <= 2000, 'Description must be at most 2,000 characters')
  .nullable();

export const CreateTaskSchema = z.object({
  title: TitleInputSchema,
  description: DescriptionInputSchema.optional(),
  due_date: DueDateSchema.nullable().optional(),
}, { error: 'Task request body must be a JSON object' });

export const UpdateTaskSchema = z.object({
  title: TitleInputSchema.optional(),
  description: DescriptionInputSchema.optional(),
  status: TaskStatusSchema.optional(),
  due_date: DueDateSchema.nullable().optional(),
}, { error: 'Task update body must be a JSON object' }).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided',
});

export const TaskFilterSchema = z.object({
  status: TaskStatusSchema.optional(),
}, { error: 'Task filter must be a JSON object' });
