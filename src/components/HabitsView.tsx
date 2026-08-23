import React, { useState } from 'react';
import { HabitItem } from '../types';

interface HabitsViewProps {
  habits: HabitItem[];
  onToggleStreak: (habitId: string, dayIdx: number) => void;
  onAddHabit: (name: string, targetPerWeek: number) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleStreak,
  onAddHabit,
  onDeleteHabit
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(5);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), target);
    setName('');
    setIsAdding(false);
  };

  const totalCompleted = habits.reduce(
    (acc, h) => acc + h.streaks.filter(Boolean).length,
    0
  );
  const totalPossible = habits.length * 5;
  const habitPct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Overview Card */}
      <section className="bg-[#1c2028] p-5 rounded-xl micro-border space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#dfe2ee]">Habits & Routines</h1>
            <p className="text-xs text-[#c2c6d6]">Streak Consistency Engine</p>
          </div>
          <button
            id="habits-add-new-btn"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#4edea3] text-[#003824] px-3.5 py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold hover:bg-[#4edea3]/90 cursor-pointer shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Habit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-[#181c24] p-3.5 rounded-xl micro-border text-center">
          <div>
            <p className="text-[10px] text-[#c2c6d6] uppercase font-semibold">Weekly Completion</p>
            <p className="text-lg font-bold text-[#4edea3]">{habitPct}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#c2c6d6] uppercase font-semibold">Active Habits</p>
            <p className="text-lg font-bold text-[#adc6ff]">{habits.length}</p>
          </div>
        </div>
      </section>

      {/* Inline Create Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateHabit}
          className="bg-[#181c24] p-4 rounded-xl micro-border space-y-3"
        >
          <h3 className="text-xs font-bold text-[#4edea3]">Add New Daily Habit</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                Habit Title
              </label>
              <input
                id="new-habit-title-input"
                type="text"
                placeholder="e.g. Read 20 mins, Journaling"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                Target / Wk
              </label>
              <input
                id="new-habit-target-input"
                type="number"
                min="1"
                max="7"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 5)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-[#c2c6d6]"
            >
              Cancel
            </button>
            <button
              id="submit-create-habit-btn"
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[#4edea3] text-[#003824] rounded-lg"
            >
              Start Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit Cards Matrix */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const doneCount = habit.streaks.filter(Boolean).length;
          return (
            <div
              key={habit.id}
              className="bg-[#1c2028] p-4 rounded-xl micro-border space-y-3 group hover:border-[#424754] transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-[#dfe2ee]">{habit.name}</h3>
                  <p className="text-[11px] text-[#c2c6d6]">
                    {doneCount} of 5 completed this cycle
                  </p>
                </div>

                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#8c909f] hover:text-[#ffb4ab] transition-all cursor-pointer"
                  title="Delete habit"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              {/* Day dot toggles */}
              <div className="flex justify-between items-center bg-[#181c24] p-3 rounded-lg micro-border">
                {['M', 'T', 'W', 'T', 'F'].map((dayLabel, idx) => {
                  const isDone = habit.streaks[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => onToggleStreak(habit.id, idx)}
                      className="flex flex-col items-center gap-1 cursor-pointer group/dot focus:outline-none"
                    >
                      <span className="text-[10px] font-semibold text-[#8c909f]">
                        {dayLabel}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#4edea3] text-[#003824] shadow-sm scale-105'
                            : 'bg-[#31353e] hover:bg-[#353942] text-[#8c909f]'
                        }`}
                      >
                        {isDone && (
                          <span className="material-symbols-outlined text-[14px] font-bold">
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
