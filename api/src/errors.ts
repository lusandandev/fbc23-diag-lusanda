import { z } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly fieldErrors?: Record<string, string>;

  constructor(statusCode: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

export const validationError = (error: z.ZodError): AppError => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? String(issue.path[0]) : 'form';
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  const message = Object.entries(fieldErrors)
    .map(([field, detail]) => `${field === 'form' ? 'Request' : field}: ${detail}`)
    .join('. ');

  return new AppError(400, message || 'Request validation failed', fieldErrors);
};

/** Parse untrusted input once and convert Zod failures into the API's standard 400 error. */
export const parseOrThrow = <Schema extends z.ZodType>(schema: Schema, input: unknown): z.output<Schema> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
};
