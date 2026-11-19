'use client';

import { useCallback, useState } from 'react';
import ErrorBanner from '../components/ErrorBanner';
import LoginForm from '../components/LoginForm';
import StatusFilter from '../components/StatusFilter';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { ApiClientError } from '../lib/api';
import type { Task, TaskInput } from '../types/task';

export default function Home() {
  const { token, isReady, login, logout } = useAuth();
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleUnauthorized = useCallback(() => {
    logout();
    setSessionNotice('Session expired. Please log in again.');
  }, [logout]);

  const {
    tasks,
    filter,
    setFilter,
    isLoading,
    isSaving,
    error,
    setError,
    saveTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks({ token, onUnauthorized: handleUnauthorized });

  const handleLogin = async (email: string, password: string) => {
    setSessionNotice(null);
    await login(email, password);
  };

  const handleLogout = () => {
    logout();
    setEditingTask(null);
    setSessionNotice(null);
  };

  const handleSaveTask = async (input: TaskInput) => {
    setFieldErrors({});
    try {
      await saveTask(input, editingTask?.id);
      setEditingTask(null);
    } catch (caught) {
      if (caught instanceof ApiClientError) setFieldErrors(caught.fields);
    }
  };

  const handleEdit = (task: Task) => {
    setFieldErrors({});
    setError(null);
    setEditingTask(task);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setFieldErrors({});
  };

  if (!isReady) {
    return <main className="mx-auto max-w-md p-8 text-center text-gray-500">Loading session...</main>;
  }

  if (!token) {
    return <LoginForm initialError={sessionNotice} onSubmit={handleLogin} />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 font-sans sm:px-6 sm:py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Task Tracker</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>

      <ErrorBanner message={error} />
      <TaskForm
        initialTask={editingTask}
        isSaving={isSaving}
        fieldErrors={fieldErrors}
        onSubmit={handleSaveTask}
        onCancel={handleCancelEdit}
      />
      <StatusFilter value={filter} onChange={setFilter} />
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onToggle={toggleTaskStatus}
        onEdit={handleEdit}
        onDelete={deleteTask}
      />
    </main>
  );
}
