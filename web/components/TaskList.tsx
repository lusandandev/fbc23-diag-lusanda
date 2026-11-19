import type { Task } from '../types/task';
import TaskItem from './TaskItem';

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
};

export default function TaskList({ tasks, isLoading, onToggle, onEdit, onDelete }: TaskListProps) {
  if (isLoading) {
    return <p className="py-4 text-center text-gray-500 dark:text-gray-400" aria-live="polite">Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="font-medium text-gray-500 dark:text-gray-400">No tasks found in this view.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
