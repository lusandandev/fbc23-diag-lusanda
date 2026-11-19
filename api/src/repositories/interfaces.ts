import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types/task';

export type UserRecord = {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
};

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | undefined>;
}

export interface TaskRepository {
  findAllByUser(userId: number, status?: TaskStatus): Promise<Task[]>;
  create(userId: number, input: CreateTaskInput): Promise<Task>;
  update(userId: number, taskId: number, input: UpdateTaskInput): Promise<boolean>;
  delete(userId: number, taskId: number): Promise<boolean>;
}
