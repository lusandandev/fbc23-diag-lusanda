import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();
  router.post('/login', controller.login);
  return router;
};
