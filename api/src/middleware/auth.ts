import type { Request, RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { AppError } from '../errors';

export interface AuthRequest extends Request {
  userId?: number;
}

type TokenPayload = JwtPayload & { id?: unknown };

export const createRequireAuth = (jwtSecret: string): RequestHandler => (request, response, next) => {
  const authHeader = request.headers.authorization;
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    response.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(match[1], jwtSecret) as TokenPayload;
    if (typeof decoded.id !== 'number' || !Number.isSafeInteger(decoded.id) || decoded.id <= 0) {
      response.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    (request as AuthRequest).userId = decoded.id;
    next();
  } catch {
    response.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

export const authenticatedUserId = (request: AuthRequest): number => {
  if (!request.userId) throw new AppError(401, 'Unauthorized');
  return request.userId;
};
