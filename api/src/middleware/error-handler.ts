import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(error.fieldErrors ? { fields: error.fieldErrors } : {}),
    });
    return;
  }

  const parserError = error as { status?: number; type?: string; message?: string };
  if (parserError?.type === 'entity.too.large' || parserError?.status === 413) {
    response.status(413).json({ success: false, error: 'Request body exceeds the 10 KB limit.' });
    return;
  }

  if (error instanceof SyntaxError && parserError?.status === 400) {
    response.status(400).json({ success: false, error: 'Malformed JSON body.' });
    return;
  }

  console.error('Server error:', error);
  response.status(500).json({ success: false, error: 'Internal server error.' });
};
