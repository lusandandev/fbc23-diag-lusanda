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

export const validationError = (error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): AppError => {
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
