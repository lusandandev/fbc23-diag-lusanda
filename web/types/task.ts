export type TaskStatus = 'pending' | 'completed';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
};

export type TaskFilter = 'all' | TaskStatus;

export type TaskInput = {
  title: string;
  description: string | null;
  due_date: string | null;
};
