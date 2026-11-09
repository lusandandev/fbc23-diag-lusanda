'use client';

import { useState, useEffect, FormEvent } from 'react';

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: 'pending' | 'completed';
  due_date?: string | null;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (currentFilter: string) => {
    try {
      const url = currentFilter === 'all'
        ? 'http://localhost:3001/tasks'
        : `http://localhost:3001/tasks?status=${currentFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks(filter);
  }, [filter]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      description: description || null,
      due_date: dueDate || null
    };

    try {
      const url = editingId ? `http://localhost:3001/tasks/${editingId}` : 'http://localhost:3001/tasks';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Something went wrong');
        return;
      }

      resetForm();
      fetchTasks(filter);
    } catch (err) {
      setError('Network error. Is the API running?');
    }
  };

  const handleEditInit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.due_date || '');
    setError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setError(null);
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    await fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks(filter);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'DELETE'
    });
    fetchTasks(filter);
  };

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-8 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Task Tracker</h1>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Task Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Task' : 'Create New Task'}
        </h2>

        <div className="grid gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>

          <div>
            <label htmlFor="due-date" className="block text-sm font-medium mb-1">Due Date (Optional)</label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium">
            {editingId ? 'Update Task' : 'Save Task'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 font-medium">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Filter Options */}
      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="status-filter" className="font-semibold">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border p-2 rounded bg-white shadow-sm"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <ul className="space-y-4">
        {tasks.map(task => (
          <li key={task.id} className="p-5 border rounded-lg shadow-sm bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4">

            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => toggleStatus(task.id, task.status)}
                  aria-label={`Mark "${task.title}" as ${task.status === 'pending' ? 'completed' : 'pending'}`}
                  className="w-5 h-5 cursor-pointer accent-blue-600"
                />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{task.description}</p>
                )}
                {task.due_date && (
                  <p className="text-sm text-gray-500 mt-2 font-medium">
                    🗓 Due: {task.due_date}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:flex-col sm:w-24">
              <button
                onClick={() => handleEditInit(task)}
                className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded hover:bg-gray-200 text-sm font-medium border"
                aria-label={`Edit task "${task.title}"`}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="flex-1 bg-red-50 text-red-600 py-1.5 px-3 rounded hover:bg-red-100 text-sm font-medium border border-red-100"
                aria-label={`Delete task "${task.title}"`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No tasks found in this view.</p>
          </div>
        )}
      </ul>
    </main>
  );
}