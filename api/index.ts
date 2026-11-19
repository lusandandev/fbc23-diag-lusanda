import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getDb } from './db';
import { getTasks, createTask, updateTask, deleteTask } from './controllers/taskController';
import { login } from './controllers/authController';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = 3001;

// Important for comm obviously
app.use(cors());
app.use(express.json({ limit: '10kb' }));

getDb().catch(err => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running' });
});

// auth
app.post('/login', login);

// protected task routes
app.use('/tasks', requireAuth);
app.get('/tasks', getTasks);
app.post('/tasks', createTask);
app.put('/tasks/:id', updateTask);
app.delete('/tasks/:id', deleteTask);

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Server Error:", err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ success: false, error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Express API running on http://localhost:${PORT}`);
});