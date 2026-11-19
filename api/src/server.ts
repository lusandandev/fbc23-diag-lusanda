import { loadConfig } from './config';
import { createApp } from './app';
import { openDatabase } from './db/connection';
import { createSchema } from './db/schema';
import { seedDemoUsers } from './db/seed';
import { AuthController } from './controllers/auth.controller';
import { TaskController } from './controllers/task.controller';
import { SqliteTaskRepository } from './repositories/sqlite-task.repository';
import { SqliteUserRepository } from './repositories/sqlite-user.repository';
import { AuthService } from './services/auth.service';
import { TaskService } from './services/task.service';

const startServer = async (): Promise<void> => {
  const config = loadConfig();
  const db = await openDatabase(config);
  await createSchema(db);

  if (config.nodeEnv === 'development') {
    await seedDemoUsers(db);
  }

  const userRepository = new SqliteUserRepository(db);
  const taskRepository = new SqliteTaskRepository(db);
  const authService = new AuthService(userRepository, config.jwtSecret);
  const taskService = new TaskService(taskRepository);
  const authController = new AuthController(authService);
  const taskController = new TaskController(taskService);

  const app = createApp({
    webOrigin: config.webOrigin,
    jwtSecret: config.jwtSecret,
    authController,
    taskController,
  });

  app.listen(config.port, () => {
    console.log(`Express API running on http://localhost:${config.port}`);
    console.log(`Database: ${config.databasePath}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('API startup failed:', error);
  process.exit(1);
});
