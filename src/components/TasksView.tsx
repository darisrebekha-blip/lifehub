import React, { useState } from 'react';
import { TaskItem, Priority } from '../types';

interface TasksViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MED');
  const [newCategory, setNewCategory] = useState('Work');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header Summary */}
      <div className="flex justify-between items-center bg-[#1c2028] p-4 rounded-xl micro-border">
        <div>
          <h1 className="text-xl font-bold text-[#dfe2ee]">Tasks & Operations</h1>
          <p className="text-xs text-[#c2c6d6]">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <button
          id="tasks-add-new-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#adc6ff] text-[#00285d] px-3.5 py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold hover:bg-[#adc6ff]/90 cursor-pointer shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>{isAdding ? 'Close' : 'Add Task'}</span>
        </button>
      </div>

      {/* Inline New Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-[#181c24] p-4 rounded-xl micro-border space-y-3"
        >
          <h3 className="text-xs font-bold text-[#adc6ff]">Create New Task</h3>
          <div>
            <input
              id="new-task-title-input"
              type="text"
              placeholder="Task description..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-sm text-[#dfe2ee] placeholder-[#8c909f] focus:border-[#adc6ff] outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                Priority
              </label>
              <select
                id="new-task-priority-select"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] focus:border-[#adc6ff] outline-none"
              >
                <option value="HIGH">HIGH Priority</option>
                <option value="MED">MED Priority</option>
                <option value="LOW">LOW Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                Category
              </label>
              <input
                id="new-task-category-input"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Work, Health"
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] focus:border-[#adc6ff] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-[#c2c6d6] hover:bg-[#262a33] rounded-lg"
            >
              Cancel
            </button>
            <button
              id="submit-create-task-btn"
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[#adc6ff] text-[#00285d] rounded-lg hover:bg-[#adc6ff]/90"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1c2028] p-2 rounded-xl micro-border">
        {/* Status filters */}
        <div className="flex items-center gap-1">
          {(['all', 'active', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#31353e] text-[#adc6ff] border border-[#424754]'
                  : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Priority filters */}
        <div className="flex items-center gap-1">
          {(['ALL', 'HIGH', 'MED', 'LOW'] as const).map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterPriority === pri
                  ? 'bg-[#adc6ff] text-[#00285d]'
                  : 'bg-[#181c24] text-[#c2c6d6] hover:bg-[#262a33]'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Task Items List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#1c2028] p-8 text-center rounded-xl micro-border text-xs text-[#8c909f]">
            No tasks match your filter criteria.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-[#1c2028] rounded-xl micro-border hover:border-[#424754] transition-all group"
            >
              <button
                onClick={() => onToggleTask(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  task.completed
                    ? 'bg-[#4edea3] border-[#4edea3]'
                    : 'border-[#424754] hover:border-[#4edea3]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[14px] text-[#00311f] font-bold ${
                    task.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`}
                >
                  check
                </span>
              </button>

              <div className="flex-grow min-w-0">
                <p
                  className={`text-sm font-medium transition-all ${
                    task.completed ? 'line-through text-[#8c909f]' : 'text-[#dfe2ee]'
                  }`}
                >
                  {task.title}
                </p>
                {task.category && (
                  <span className="text-[10px] text-[#8c909f] font-mono">
                    #{task.category}
                  </span>
                )}
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  task.priority === 'HIGH'
                    ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                    : task.priority === 'MED'
                    ? 'bg-[#ca8100]/25 text-[#ffb95f]'
                    : 'bg-[#00285d]/40 text-[#adc6ff]'
                }`}
              >
                {task.priority}
              </span>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#8c909f] hover:text-[#ffb4ab] transition-all cursor-pointer"
                title="Delete task"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
