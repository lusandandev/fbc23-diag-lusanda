'use client';

import { useState, type FormEvent } from 'react';
import type { Task, TaskInput } from '../types/task';

type TaskFormProps = {
  initialTask: Task | null;
  isSaving: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
};

export default function TaskForm({ initialTask, isSaving, fieldErrors, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [dueDate, setDueDate] = useState(initialTask?.due_date ?? '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      title,
      description: description.trim() ? description : null,
      due_date: dueDate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold">{initialTask ? 'Edit Task' : 'Create New Task'}</h2>
      <div className="mb-4 grid gap-4">
        <div>
          <label htmlFor="task-title" className="mb-1 block text-sm font-medium">Title *</label>
          <input
            id="task-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? 'task-title-error' : undefined}
            className="w-full rounded border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            required
            maxLength={255}
          />
          {fieldErrors.title && <p id="task-title-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{fieldErrors.title}</p>}
        </div>
        <div>
          <label htmlFor="task-description" className="mb-1 block text-sm font-medium">Description (Optional)</label>
          <textarea
            id="task-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? 'task-description-error' : undefined}
            className="min-h-20 w-full rounded border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            maxLength={2000}
          />
          {fieldErrors.description && <p id="task-description-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{fieldErrors.description}</p>}
        </div>
        <div>
          <label htmlFor="task-due-date" className="mb-1 block text-sm font-medium">Due Date (Optional)</label>
          <input
            id="task-due-date"
            name="due_date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-invalid={Boolean(fieldErrors.due_date)}
            aria-describedby={fieldErrors.due_date ? 'task-due-date-error' : undefined}
            className="w-full rounded border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          {fieldErrors.due_date && <p id="task-due-date-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{fieldErrors.due_date}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : initialTask ? 'Update Task' : 'Save Task'}
        </button>
        {initialTask && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded bg-gray-200 px-5 py-2 font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
