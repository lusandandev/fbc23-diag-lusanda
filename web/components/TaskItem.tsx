import type { Task } from '../types/task';

type TaskItemProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) onDelete(task.id);
  };

  return (
    <li className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-opacity dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <input
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={() => onToggle(task)}
          aria-label={`Mark “${task.title}” as ${task.status === 'pending' ? 'completed' : 'pending'}`}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
        />
        <div className="min-w-0">
          <h3 className={`break-words text-lg font-semibold ${task.status === 'completed' ? 'text-gray-500 line-through dark:text-gray-400' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 whitespace-pre-wrap break-words text-gray-600 dark:text-gray-300">{task.description}</p>
          )}
          {task.due_date && (
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Due: {task.due_date}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 sm:w-24 sm:flex-col">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex-1 rounded border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
          aria-label={`Edit task “${task.title}”`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-1 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950"
          aria-label={`Delete task “${task.title}”`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
