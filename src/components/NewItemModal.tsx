import React, { useState } from 'react';
import { Priority } from '../types';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: { title: string; priority: Priority; category: string }) => void;
  onAddExpense: (expense: { title: string; amount: number; category: string }) => void;
  onAddHabit: (name: string, targetPerWeek: number) => void;
  onAddSteps?: (steps: number) => void;
  onAddNote: (content: string) => void;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onAddExpense,
  onAddHabit,
  onAddSteps,
  onAddNote
}) => {
  const [itemType, setItemType] = useState<'task' | 'expense' | 'habit' | 'steps' | 'note'>('task');

  // Form states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MED');
  const [category, setCategory] = useState('Work');
  const [amount, setAmount] = useState('');
  const [stepsCount, setStepsCount] = useState('1000');
  const [targetWeekly, setTargetWeekly] = useState(5);
  const [noteContent, setNoteContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemType === 'task') {
      if (!title.trim()) return;
      onAddTask({ title: title.trim(), priority, category });
    } else if (itemType === 'expense') {
      const num = parseFloat(amount);
      if (!title.trim() || isNaN(num)) return;
      onAddExpense({ title: title.trim(), amount: num, category: category || 'General' });
    } else if (itemType === 'habit') {
      if (!title.trim()) return;
      onAddHabit(title.trim(), targetWeekly);
    } else if (itemType === 'steps') {
      const st = parseInt(stepsCount, 10);
      if (!isNaN(st) && st > 0 && onAddSteps) {
        onAddSteps(st);
      }
    } else if (itemType === 'note') {
      if (!noteContent.trim()) return;
      onAddNote(noteContent.trim());
    }

    // Reset and close
    setTitle('');
    setAmount('');
    setNoteContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#1c2028] border border-[#21262d] rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#dfe2ee]">Create New Item</h2>
          <button
            id="close-new-item-modal-btn"
            onClick={onClose}
            className="text-[#8c909f] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-[#181c24] p-1 rounded-lg micro-border">
          <button
            id="modal-select-task-type-btn"
            type="button"
            onClick={() => setItemType('task')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
              itemType === 'task'
                ? 'bg-[#adc6ff] text-[#00285d]'
                : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
            }`}
          >
            Task
          </button>
          <button
            id="modal-select-expense-type-btn"
            type="button"
            onClick={() => setItemType('expense')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
              itemType === 'expense'
                ? 'bg-[#ffb95f] text-[#3e2400]'
                : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
            }`}
          >
            Expense
          </button>
          <button
            id="modal-select-habit-type-btn"
            type="button"
            onClick={() => setItemType('habit')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
              itemType === 'habit'
                ? 'bg-[#4edea3] text-[#003824]'
                : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
            }`}
          >
            Habit
          </button>
          <button
            id="modal-select-steps-type-btn"
            type="button"
            onClick={() => setItemType('steps')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
              itemType === 'steps'
                ? 'bg-[#80d5ff] text-[#00344d]'
                : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
            }`}
          >
            Steps
          </button>
          <button
            id="modal-select-note-type-btn"
            type="button"
            onClick={() => setItemType('note')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-all ${
              itemType === 'note'
                ? 'bg-[#31353e] text-[#adc6ff]'
                : 'text-[#c2c6d6] hover:text-[#dfe2ee]'
            }`}
          >
            Note
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {itemType === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                  Task Title
                </label>
                <input
                  id="modal-task-title-input"
                  type="text"
                  placeholder="e.g. Prepare presentation slides"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-sm text-[#dfe2ee] outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                    Priority
                  </label>
                  <select
                    id="modal-task-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MED">MED</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                    Category
                  </label>
                  <input
                    id="modal-task-category-input"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {itemType === 'expense' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                  Expense Description
                </label>
                <input
                  id="modal-expense-title-input"
                  type="text"
                  placeholder="e.g. Lunch with team"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-sm text-[#dfe2ee] outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                    Amount ($)
                  </label>
                  <input
                    id="modal-expense-amount-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                    Category
                  </label>
                  <input
                    id="modal-expense-category-input"
                    type="text"
                    placeholder="Food, Transport, Sub"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {itemType === 'habit' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                  Habit Name
                </label>
                <input
                  id="modal-habit-name-input"
                  type="text"
                  placeholder="e.g. 15min Meditation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-sm text-[#dfe2ee] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                  Weekly Goal (Days)
                </label>
                <input
                  id="modal-habit-weekly-goal-input"
                  type="number"
                  min="1"
                  max="7"
                  value={targetWeekly}
                  onChange={(e) => setTargetWeekly(parseInt(e.target.value) || 5)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                />
              </div>
            </>
          )}

          {itemType === 'steps' && (
            <div>
              <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                Steps Walked
              </label>
              <input
                id="modal-steps-count-input"
                type="number"
                min="1"
                placeholder="e.g. 1000"
                value={stepsCount}
                onChange={(e) => setStepsCount(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-sm text-[#dfe2ee] outline-none mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                {[500, 1000, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStepsCount(preset.toString())}
                    className="flex-1 py-1.5 bg-[#0a0e16] micro-border rounded text-[11px] font-mono text-[#adc6ff] hover:bg-[#262a33]"
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {itemType === 'note' && (
            <div>
              <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                Scratchpad Note
              </label>
              <textarea
                id="modal-scratchpad-note-textarea"
                placeholder="Append quick note content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg p-3 text-sm text-[#dfe2ee] min-h-[100px] outline-none resize-none font-mono"
                autoFocus
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#c2c6d6] hover:bg-[#262a33] rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-modal-create-btn"
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#adc6ff] text-[#00285d] rounded-lg hover:bg-[#adc6ff]/90 cursor-pointer shadow-sm"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
