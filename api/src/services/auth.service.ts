import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors';
import type { UserRepository } from '../repositories/interfaces';

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtSecret: string,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.users.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new AppError(401, 'Invalid credentials');
    }

    return jwt.sign({ id: user.id }, this.jwtSecret, { expiresIn: '24h' });
  }
}
