import type { Request, Response } from 'express';
import { validationError } from '../errors';
import { LoginSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: Request, response: Response): Promise<void> => {
    const parsed = LoginSchema.safeParse(request.body);
    if (!parsed.success) throw validationError(parsed.error);

    const token = await this.authService.login(parsed.data.email, parsed.data.password);
    response.status(200).json({ success: true, token });
  };
}
