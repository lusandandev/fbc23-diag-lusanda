import type { Request, RequestHandler } from 'express';
import { AppError } from '../errors';
import { JwtService } from '../services/jwt.service';

// Extends Express Request with the verified user ID
export interface AuthRequest extends Request {
  userId?: number;
}

// Middleware that verifies the Bearer JWT and attaches userId to the request
export const createRequireAuth = (tokens: JwtService): RequestHandler => (request, _response, next) => {
  const authHeader = request.headers.authorization;
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    next(new AppError(401, 'Unauthorized'));
    return;
  }

  try {
    (request as AuthRequest).userId = tokens.verifyUserToken(match[1]);
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Unauthorized'));
  }
};

// Returns a valid positive integer userId or throws 401
export const authenticatedUserId = (request: AuthRequest): number => {
  if (!Number.isSafeInteger(request.userId) || (request.userId ?? 0) <= 0) {
    throw new AppError(401, 'Unauthorized');
  }
  return request.userId as number;
};
