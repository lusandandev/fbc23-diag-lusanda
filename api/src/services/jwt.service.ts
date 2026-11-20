import jwt, { type JwtPayload } from 'jsonwebtoken';
import { AppError } from '../errors';

type UserTokenPayload = JwtPayload & { id?: unknown };

/** Owns all JWT signing and verification so token policy lives in one place. */
export class JwtService {
  constructor(private readonly secret: string) {}

  signUserToken(userId: number): string {
    return jwt.sign({ id: userId }, this.secret, { expiresIn: '24h' });
  }

  verifyUserToken(token: string): number {
    try {
      const decoded = jwt.verify(token, this.secret) as UserTokenPayload;
      if (
        typeof decoded.id !== 'number'
        || !Number.isSafeInteger(decoded.id)
        || decoded.id <= 0
      ) {
        throw new Error('JWT does not contain a valid user ID.');
      }

      return decoded.id;
    } catch {
      throw new AppError(401, 'Unauthorized');
    }
  }
}
