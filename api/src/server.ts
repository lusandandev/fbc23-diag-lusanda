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
import { JwtService } from './services/jwt.service';
import { TaskService } from './services/task.service';

// Bootstraps configuration, database, dependencies, and the HTTP server
const startServer = async (): Promise<void> => {
  const config = loadConfig();

  // Initialize SQLite database and seed demo data in development
  const db = await openDatabase(config);
  await createSchema(db);

  if (config.nodeEnv === 'development') {
    await seedDemoUsers(db);
  }

  // Wire repositories, services, and controllers
  const userRepository = new SqliteUserRepository(db);
  const taskRepository = new SqliteTaskRepository(db);
  const jwtService = new JwtService(config.jwtSecret);
  const authService = new AuthService(userRepository, jwtService);
  const taskService = new TaskService(taskRepository);
  const authController = new AuthController(authService);
  const taskController = new TaskController(taskService);

  const app = createApp({
    webOrigin: config.webOrigin,
    jwtService,
    authController,
    taskController,
  });

  // Exit cleanly if the HTTP server fails to bind to the configured port
  const failToListen = (error?: Error) => {
    if (!error) return;
    console.error(`API failed to listen on port ${config.port}: ${error.message}`);
    process.exit(1);
  };

  const server = app.listen(config.port, (error?: Error) => {
    if (error) {
      failToListen(error);
      return;
    }
    console.log(`Express API running on http://localhost:${config.port}`);
    console.log(`Database: ${config.databasePath}`);
  });

  // Also listen for Node's standard server error event (for example EADDRINUSE).
  server.on('error', failToListen);
};

// Catch unhandled initialization errors and terminate the process
startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  console.error(`API startup failed: ${message}`);
  process.exit(1);
});
