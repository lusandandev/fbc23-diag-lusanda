import type { TaskFilter } from '../types/task';

type StatusFilterProps = {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
};

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label htmlFor="status-filter" className="font-semibold">Filter by Status:</label>
      <select
        id="status-filter"
        value={value}
        onChange={(event) => onChange(event.target.value as TaskFilter)}
        className="rounded border border-gray-300 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <option value="all">All Tasks</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
