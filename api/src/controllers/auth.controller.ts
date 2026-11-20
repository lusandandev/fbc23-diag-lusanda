import type { Request, Response } from 'express';
import { parseOrThrow } from '../errors';
import { LoginSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: Request, response: Response): Promise<void> => {
    const input = parseOrThrow(LoginSchema, request.body);
    const token = await this.authService.login(input.email, input.password);
    response.status(200).json({ success: true, token });
  };
}
