'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: 'pending' | 'completed';
  due_date?: string | null;
};

type FilterType = 'all' | 'pending' | 'completed';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('lusanda@example.com');
  const [loginPass, setLoginPass] = useState('password123');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setError('Network error during login');
    }
  };

  // Helper returns null on failure instead of throwing, avoiding empty catch blocks
  const handleApiRequest = useCallback(async (url: string, options: RequestInit = {}, skipLoading = false) => {
    if (!skipLoading && tasks.length === 0) setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options.headers,
        }
      });

      if (res.status === 401) {
          handleLogout();
          setError('Session expired. Please log in again.');
          return null;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Request failed');
        return null;
      }

      return data;
    } catch (err: any) {
      setError('Network error connecting to API.');
      return null;
    } finally {
      if (!skipLoading) setIsLoading(false);
    }
  }, [token, tasks.length, handleLogout]);

  const fetchTasks = useCallback(async (currentFilter: string, silent = false) => {
    if (!token) return;
    const url = currentFilter === 'all'
      ? `${API_URL}/tasks`
      : `${API_URL}/tasks?status=${currentFilter}`;

    const data = await handleApiRequest(url, undefined, silent);
    if (data) setTasks(data.data);
  }, [token, handleApiRequest]);

  useEffect(() => {
    if (token) fetchTasks(filter);
  }, [filter, token, fetchTasks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      description: description || null,
      due_date: dueDate || null
    };

    const url = editingId ? `${API_URL}/tasks/${editingId}` : `${API_URL}/tasks`;
    const options = {
      method: editingId ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    };

    const result = await handleApiRequest(url, options, true);
    if (!result) return; // Stop if the request failed (error state is already set)

    resetForm();
    fetchTasks(filter, true);
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

    const result = await handleApiRequest(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    }, true);

    if (result) fetchTasks(filter, true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const result = await handleApiRequest(`${API_URL}/tasks/${id}`, {
      method: 'DELETE'
    }, true);

    if (result) fetchTasks(filter, true);
  };

  if (!token) {
    return (
      <main className="max-w-md mx-auto p-8 mt-20 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm font-sans">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium mt-2">
            Log In
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Tracker</h1>
        <button
          onClick={handleLogout}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border dark:border-gray-600 px-4 py-1.5 rounded text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Task' : 'Create New Task'}</h2>
        <div className="grid gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
              maxLength={255}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              maxLength={2000}
            />
          </div>
          <div>
            <label htmlFor="due-date" className="block text-sm font-medium mb-1">Due Date (Optional)</label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium">
            {editingId ? 'Update Task' : 'Save Task'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-gray-800 px-5 py-2 rounded hover:bg-gray-300 font-medium">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="status-filter" className="font-semibold">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="border dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 shadow-sm"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <ul className="space-y-4">
        {isLoading && <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading tasks...</p>}

        {!isLoading && tasks.length === 0 && (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks found in this view.</p>
          </div>
        )}

        {!isLoading && tasks.map(task => (
          <li key={task.id} className="p-5 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-opacity">
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
                <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">{task.description}</p>
                )}
                {task.due_date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    🗓 Due: {task.due_date}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:flex-col sm:w-24">
              <button
                onClick={() => handleEditInit(task)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 py-1.5 px-3 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium border dark:border-gray-600"
                aria-label={`Edit task "${task.title}"`}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-1.5 px-3 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium border border-red-100 dark:border-red-800/30"
                aria-label={`Delete task "${task.title}"`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}