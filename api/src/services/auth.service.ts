import bcrypt from 'bcryptjs';
import { AppError } from '../errors';
import type { UserRepository } from '../repositories/interfaces';
import { JwtService } from './jwt.service';

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: JwtService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.users.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new AppError(401, 'Invalid credentials');
    }

    return this.tokens.signUserToken(user.id);
  }
}
