'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiClientError, apiRequest } from '../lib/api';
import type { Task, TaskFilter, TaskInput } from '../types/task';

type TasksResponse = {
  success: true;
  data: Task[];
};

type UseTasksOptions = {
  token: string | null;
  onUnauthorized: () => void;
};

export const useTasks = ({ token, onUnauthorized }: UseTasksOptions) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((caught: unknown) => {
    if (caught instanceof ApiClientError && caught.status === 401) {
      setTasks([]);
      onUnauthorized();
      return;
    }

    setError(caught instanceof Error ? caught.message : 'An unexpected error occurred.');
  }, [onUnauthorized]);

  const refreshTasks = useCallback(async (silent = false) => {
    if (!token) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    setError(null);

    const query = filter === 'all' ? '' : `?status=${filter}`;

    try {
      const result = await apiRequest<TasksResponse>(`/tasks${query}`, {}, token);
      setTasks(result.data);
    } catch (caught) {
      handleError(caught);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [filter, handleError, token]);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  const saveTask = useCallback(async (input: TaskInput, taskId?: number) => {
    if (!token) return;
    setIsSaving(true);
    setError(null);

    try {
      await apiRequest(taskId ? `/tasks/${taskId}` : '/tasks', {
        method: taskId ? 'PATCH' : 'POST',
        body: JSON.stringify(input),
      }, token);
      await refreshTasks(true);
    } catch (caught) {
      handleError(caught);
      throw caught;
    } finally {
      setIsSaving(false);
    }
  }, [handleError, refreshTasks, token]);

  const toggleTaskStatus = useCallback(async (task: Task) => {
    if (!token) return;
    setError(null);

    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: task.status === 'pending' ? 'completed' : 'pending' }),
      }, token);
      await refreshTasks(true);
    } catch (caught) {
      handleError(caught);
    }
  }, [handleError, refreshTasks, token]);

  const deleteTask = useCallback(async (taskId: number) => {
    if (!token) return;
    setError(null);

    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' }, token);
      await refreshTasks(true);
    } catch (caught) {
      handleError(caught);
    }
  }, [handleError, refreshTasks, token]);

  return {
    tasks,
    filter,
    setFilter,
    isLoading,
    isSaving,
    error,
    setError,
    refreshTasks,
    saveTask,
    toggleTaskStatus,
    deleteTask,
  };
};
