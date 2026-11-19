import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler';
import { createRequireAuth } from './middleware/auth';
import { createAuthRoutes } from './routes/auth.routes';
import { createTaskRoutes } from './routes/task.routes';
import { AuthController } from './controllers/auth.controller';
import { TaskController } from './controllers/task.controller';

export type AppDependencies = {
  webOrigin: string;
  jwtSecret: string;
  authController: AuthController;
  taskController: TaskController;
};

export const createApp = (dependencies: AppDependencies): Express => {
  const app = express();

  app.use(cors({ origin: dependencies.webOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_request: Request, response: Response) => {
    response.status(200).json({ status: 'API is running' });
  });

  app.use(createAuthRoutes(dependencies.authController));
  app.use('/tasks', createRequireAuth(dependencies.jwtSecret), createTaskRoutes(dependencies.taskController));

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ success: false, error: 'Endpoint not found.' });
  });

  app.use(errorHandler);
  return app;
};
