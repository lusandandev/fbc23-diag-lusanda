import type { Task as ApiTask, TaskStatus as ApiTaskStatus } from '../../api/src/types/task';

export type Task = ApiTask;
export type TaskStatus = ApiTaskStatus;
export type TaskFilter = 'all' | TaskStatus;

export type TaskInput = {
  title: string;
  description: string | null;
  due_date: string | null;
};
