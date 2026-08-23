import React, { useState, useEffect } from 'react';
import {
  TaskItem,
  HabitItem,
  WaterIntakeData,
  StepsData,
  UpcomingEventItem,
  MedicationItem,
  FinanceData,
  QuickNoteData,
  UserProfileData
} from '../types';
import { DAILY_QUOTES } from '../data/initialData';

interface HomeDashboardProps {
  profile: UserProfileData;
  tasks: TaskItem[];
  water: WaterIntakeData;
  steps: StepsData;
  habits: HabitItem[];
  events: UpcomingEventItem[];
  medications: MedicationItem[];
  finance: FinanceData;
  scratchpad: QuickNoteData;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleTask: (id: string) => void;
  onAddWater: (amountMl: number) => void;
  onAddSteps: (count: number) => void;
  onUpdateStepTarget: (target: number) => void;
  onToggleHabitStreak: (habitId: string, dayIndex: number) => void;
  onToggleMedication: (id: string) => void;
  onUpdateScratchpad: (content: string) => void;
  onOpenNewModal: () => void;
  onOpenAiModal: () => void;
  onOpenClimateModal?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  tasks,
  water,
  steps,
  habits,
  events,
  medications,
  finance,
  scratchpad,
  searchQuery,
  onSearchChange,
  onToggleTask,
  onAddWater,
  onAddSteps,
  onUpdateStepTarget,
  onToggleHabitStreak,
  onToggleMedication,
  onUpdateScratchpad,
  onOpenNewModal,
  onOpenAiModal,
  onOpenClimateModal
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteOpacity, setQuoteOpacity] = useState(1);

  // Live Clock & Dynamic Greeting
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dynamicGreeting = (() => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  })();

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Rotate quotes every 8 seconds with smooth opacity fade
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteOpacity(0);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % DAILY_QUOTES.length);
        setQuoteOpacity(1);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const remainingTasks = tasks.filter((t) => !t.completed).length;

  // Filter tasks based on searchQuery
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pedometer Motion Sensor State
  const [isPedometerActive, setIsPedometerActive] = useState(false);
  const [customStepsInput, setCustomStepsInput] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(steps ? steps.targetSteps.toString() : '10000');

  // Live Pedometer Motion Sensor Detection
  useEffect(() => {
    if (!isPedometerActive) return;
    let lastAccel = 0;
    const threshold = 11; // Acceleration threshold for step detection

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const totalAcc = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const delta = Math.abs(totalAcc - lastAccel);
      if (delta > threshold) {
        onAddSteps(1);
      }
      lastAccel = totalAcc;
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [isPedometerActive, onAddSteps]);

  // Calculate water progress percentage
  const waterPct = Math.min(100, Math.round((water.currentLiters / water.targetLiters) * 100));
  // Circumference for r=40 SVG is 2 * PI * 40 ≈ 251.2
  const waterStrokeDashoffset = 251.2 - (251.2 * waterPct) / 100;

  // Calculate steps progress percentage
  const currentSteps = steps ? steps.currentSteps : 0;
  const targetSteps = steps ? steps.targetSteps : 10000;
  const stepsPct = Math.min(100, Math.round((currentSteps / targetSteps) * 100));
  const stepsStrokeDashoffset = 251.2 - (251.2 * stepsPct) / 100;
  const calories = steps ? steps.caloriesBurned : Math.round(currentSteps * 0.04);
  const distance = steps ? steps.distanceKm : Number((currentSteps * 0.00075).toFixed(2));

  // Calculate finance percentage safely
  const financePct =
    finance.monthlyBudget > 0
      ? Math.min(100, Math.round((finance.spent / finance.monthlyBudget) * 100))
      : 0;
  // Circumference for r=35 SVG is 2 * PI * 35 ≈ 219.9
  const financeStrokeDashoffset = 219.9 - (219.9 * financePct) / 100;

  const hasCustomLocation = profile.location && profile.location !== 'Add City';
  const displayTemp =
    profile.tempUnit === 'F'
      ? `${profile.tempF ?? 82}°F`
      : `${profile.tempC ?? 28}°C`;

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-3 pb-24">
      {/* Dynamic Time Greeting Banner & Daily Motivation */}
      <section className="bg-[#181c24] p-4 rounded-xl micro-border inner-glow flex justify-between items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-[#dfe2ee]">
              {dynamicGreeting}, {profile.name || 'User'}!
            </h2>
            <span className="text-[10px] bg-[#adc6ff]/10 text-[#adc6ff] px-2 py-0.5 rounded font-mono font-semibold border border-[#adc6ff]/20">
              {formattedTime}
            </span>
          </div>
          <p
            className="text-xs italic text-[#c2c6d6] transition-opacity duration-500 leading-relaxed"
            style={{ opacity: quoteOpacity }}
          >
            "{DAILY_QUOTES[quoteIndex]}"
          </p>
        </div>

        {/* Top Climate / Weather Action */}
        <button
          id="home-climate-banner-btn"
          type="button"
          onClick={onOpenClimateModal}
          className="flex flex-col items-end text-[#adc6ff] pl-3 border-l border-[#21262d] shrink-0 whitespace-nowrap hover:opacity-80 transition-opacity cursor-pointer group"
          title="Click to Add Climate and configure City & Degrees"
        >
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px] text-[#ffb95f]">
              {profile.weatherIconSymbol || 'wb_sunny'}
            </span>
            <span className="material-symbols-outlined text-[13px] text-[#8c909f] group-hover:text-[#adc6ff]">
              tune
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#dfe2ee]">
            {hasCustomLocation ? displayTemp : 'Add Climate'}
          </span>
          <span className="text-[9px] text-[#8c909f] font-mono">
            {hasCustomLocation ? profile.location : formattedDate}
          </span>
        </button>
      </section>

      {/* Quick Actions Search & New Button */}
      <section className="flex gap-2">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d6] text-[20px]">
            search
          </span>
          <input
            id="home-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search LifeHub..."
            className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg pl-10 pr-3 py-2 text-sm text-[#dfe2ee] placeholder-[#8c909f] focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]/20 transition-all outline-none"
          />
        </div>
        <button
          id="home-new-action-btn"
          onClick={onOpenNewModal}
          className="bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New
        </button>
      </section>

      {/* AI Hub Assistant Trigger Card */}
      <section
        id="home-ai-assistant-card"
        onClick={onOpenAiModal}
        className="bg-gradient-to-r from-[#1a2333] via-[#151c2a] to-[#121622] p-3.5 rounded-xl border border-[#adc6ff]/30 hover:border-[#adc6ff]/60 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#adc6ff]/15 flex items-center justify-center text-[#adc6ff] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
              <span>LifeHub AI Command Center</span>
              <span className="text-[9px] bg-[#adc6ff] text-[#00285d] px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                Smart
              </span>
            </p>
            <p className="text-[11px] text-[#c2c6d6]">
              "Add task high priority", "Log 500ml water", "Add $15 lunch"
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#adc6ff] text-[20px] group-hover:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </section>

      {/* Grid Layout: Tasks & Water */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Today Tasks Widget */}
        <section className="bg-[#181c24] p-3.5 rounded-xl micro-border space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">
                  check_circle
                </span>
                Tasks
              </h3>
              <span className="text-[10px] text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded-full font-mono">
                {remainingTasks} left
              </span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {filteredTasks.length === 0 ? (
                <p className="text-xs text-[#8c909f] italic py-2 text-center">
                  {searchQuery ? 'No matching tasks' : 'No tasks pending!'}
                </p>
              ) : (
                filteredTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#10141d] hover:bg-[#1f2430] micro-border transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-[#adc6ff] border-[#adc6ff] text-[#00285d]'
                          : 'border-[#424754] group-hover:border-[#adc6ff]'
                      }`}
                    >
                      {task.completed && (
                        <span className="material-symbols-outlined text-[12px] font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs truncate flex-grow ${
                        task.completed ? 'line-through text-[#8c909f]' : 'text-[#dfe2ee]'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                        task.priority === 'HIGH'
                          ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]'
                          : task.priority === 'MED'
                          ? 'bg-[#ffb95f]/10 text-[#ffb95f]'
                          : 'bg-[#8c909f]/10 text-[#8c909f]'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Health & Movement Tracker Grid (Footsteps + Hydration) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Footsteps Tracker Card */}
        <section className="bg-[#181c24] p-4 rounded-xl micro-border flex flex-col justify-between space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4edea3]/10 flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-[18px]">directions_walk</span>
              </div>
              <h3 className="text-xs font-bold text-[#dfe2ee]">Footsteps</h3>
            </div>
            <button
              id="toggle-pedometer-sensor-btn"
              onClick={() => setIsPedometerActive(!isPedometerActive)}
              title="Toggle Live Pedometer Motion Sensor"
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-all cursor-pointer ${
                isPedometerActive
                  ? 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                  : 'bg-[#10141d] text-[#8c909f] border-[#21262d] hover:text-[#dfe2ee]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPedometerActive ? 'bg-[#4edea3] animate-ping' : 'bg-[#8c909f]'}`} />
              <span>{isPedometerActive ? 'Live Sensor' : 'Sensor Off'}</span>
            </button>
          </div>

          {/* Stats & Radial Progress */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#4edea3] tracking-tight">
                  {currentSteps.toLocaleString()}
                </span>
                <span className="text-xs text-[#8c909f]">/ {targetSteps.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#c2c6d6]">
                <span className="flex items-center gap-0.5 text-[#ffb95f]">
                  <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
                  {calories} kcal
                </span>
                <span className="text-[#424754]">•</span>
                <span className="flex items-center gap-0.5 text-[#adc6ff]">
                  <span className="material-symbols-outlined text-[13px]">straighten</span>
                  {distance} km
                </span>
              </div>
            </div>

            {/* Circular Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#262a33]"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#4edea3] progress-ring-circle"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={stepsStrokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-[#dfe2ee]">{stepsPct}%</span>
            </div>
          </div>

          {/* Quick Buttons & Log Toggle */}
          <div className="pt-2 border-t border-[#21262d] flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                id="home-add-500-steps-btn"
                onClick={() => onAddSteps(500)}
                className="text-[11px] font-bold bg-[#4edea3]/10 hover:bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                +500
              </button>
              <button
                id="home-add-1000-steps-btn"
                onClick={() => onAddSteps(1000)}
                className="text-[11px] font-bold bg-[#4edea3]/10 hover:bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                +1k
              </button>
              <button
                id="home-add-2500-steps-btn"
                onClick={() => onAddSteps(2500)}
                className="text-[11px] font-bold bg-[#4edea3]/10 hover:bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                +2.5k
              </button>
            </div>

            <button
              id="toggle-edit-step-target-btn"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="p-1 text-[#8c909f] hover:text-[#dfe2ee] rounded-lg hover:bg-[#21262d] transition-colors cursor-pointer"
              title="Edit Step Target"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </button>
          </div>

          {/* Collapsible Edit Target Modal / Bar */}
          {isEditingTarget && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseInt(targetInput, 10);
                if (!isNaN(num) && num > 0) {
                  onUpdateStepTarget(num);
                  setIsEditingTarget(false);
                }
              }}
              className="flex gap-1.5 pt-1"
            >
              <input
                id="edit-step-target-input"
                type="number"
                placeholder="Target steps"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-2.5 py-1 text-xs text-[#dfe2ee] outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#4edea3] text-[#003824] text-xs font-bold px-3 py-1 rounded-lg cursor-pointer shrink-0"
              >
                Save
              </button>
            </form>
          )}
        </section>

        {/* Hydration Tracker Card */}
        <section className="bg-[#181c24] p-4 rounded-xl micro-border flex flex-col justify-between space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#80d5ff]/10 flex items-center justify-center text-[#80d5ff]">
                <span className="material-symbols-outlined text-[18px]">water_drop</span>
              </div>
              <h3 className="text-xs font-bold text-[#dfe2ee]">Hydration</h3>
            </div>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#10141d] text-[#80d5ff] border border-[#21262d]">
              {waterPct >= 100 ? 'Goal Met 🎉' : `${(water.targetLiters - water.currentLiters).toFixed(1)}L left`}
            </span>
          </div>

          {/* Stats & Radial Progress */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#80d5ff] tracking-tight">
                  {water.currentLiters}
                </span>
                <span className="text-xs text-[#8c909f]">/ {water.targetLiters} L</span>
              </div>
              <p className="text-[11px] text-[#c2c6d6]">
                {waterPct}% of daily goal completed
              </p>
            </div>

            {/* Circular Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#262a33]"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#80d5ff] progress-ring-circle"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={waterStrokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-[#dfe2ee]">{waterPct}%</span>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="pt-2 border-t border-[#21262d] flex items-center gap-1.5">
            <button
              id="home-add-250ml-water-btn"
              onClick={() => onAddWater(250)}
              className="text-[11px] font-bold bg-[#80d5ff]/10 hover:bg-[#80d5ff]/20 text-[#80d5ff] border border-[#80d5ff]/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              +250ml
            </button>
            <button
              id="home-add-500ml-water-btn"
              onClick={() => onAddWater(500)}
              className="text-[11px] font-bold bg-[#80d5ff]/10 hover:bg-[#80d5ff]/20 text-[#80d5ff] border border-[#80d5ff]/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              +500ml
            </button>
            <button
              id="home-add-1000ml-water-btn"
              onClick={() => onAddWater(1000)}
              className="text-[11px] font-bold bg-[#80d5ff]/10 hover:bg-[#80d5ff]/20 text-[#80d5ff] border border-[#80d5ff]/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              +1.0L
            </button>
          </div>
        </section>
      </div>

      {/* Grid Layout: Finance & Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Finance Overview Widget */}
        <section className="bg-[#181c24] p-3.5 rounded-xl micro-border space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">
                account_balance_wallet
              </span>
              Monthly Finance
            </h3>
            <span className="text-[10px] font-mono text-[#ffb95f]">
              {financePct}% used
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full" viewBox="0 0 90 90">
                <circle
                  cx="45"
                  cy="45"
                  r="35"
                  className="text-[#262a33]"
                  strokeWidth="7"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="45"
                  cy="45"
                  r="35"
                  className="text-[#ffb95f] progress-ring-circle"
                  strokeWidth="7"
                  strokeDasharray="219.9"
                  strokeDashoffset={financeStrokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#dfe2ee]">{financePct}%</span>
              </div>
            </div>

            <div className="space-y-1 flex-grow">
              <div className="flex justify-between text-xs">
                <span className="text-[#c2c6d6]">Spent</span>
                <span className="text-[#dfe2ee] font-semibold">
                  {profile.currencySymbol || '$'}{finance.spent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#c2c6d6]">Budget</span>
                <span className="text-[#dfe2ee] font-semibold">
                  {profile.currencySymbol || '$'}{finance.monthlyBudget.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#31353e] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#ffb95f] rounded-full transition-all duration-300"
                  style={{ width: `${financePct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Habits Tracker Quick Widget */}
        <section className="bg-[#181c24] p-3.5 rounded-xl micro-border space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4edea3]">
                rebase_edit
              </span>
              Habit Streaks
            </h3>
            <span className="text-[10px] text-[#8c909f]">5-Day Bar</span>
          </div>

          <div className="space-y-2">
            {habits.slice(0, 2).map((habit) => (
              <div key={habit.id} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#dfe2ee] font-medium">{habit.name}</span>
                  <span className="text-[#4edea3] font-mono text-[10px]">
                    {habit.streaks.filter(Boolean).length}/{habit.targetPerWeek} completed
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {habit.streaks.map((active, dayIdx) => (
                    <button
                      key={dayIdx}
                      onClick={() => onToggleHabitStreak(habit.id, dayIdx)}
                      className={`h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#4edea3] text-[#003822] font-bold shadow-xs'
                          : 'bg-[#10141d] border border-[#31353e] hover:border-[#4edea3]/50'
                      }`}
                    >
                      {active && (
                        <span className="material-symbols-outlined text-[12px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grid Layout: Scratchpad Quick Notes & Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Quick Scratchpad Note */}
        <section className="bg-[#181c24] p-3.5 rounded-xl micro-border space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">
                edit_note
              </span>
              Quick Scratchpad
            </h3>
            <span className="text-[10px] text-[#8c909f] font-mono">
              Auto-saved {scratchpad.lastUpdated}
            </span>
          </div>
          <textarea
            id="home-scratchpad-textarea"
            value={scratchpad.content}
            onChange={(e) => onUpdateScratchpad(e.target.value)}
            placeholder="Type quick thoughts, ideas, or reminders..."
            rows={3}
            className="w-full bg-[#0a0e16] border border-[#31353e] rounded-lg p-2.5 text-xs text-[#dfe2ee] placeholder-[#8c909f] focus:border-[#adc6ff] outline-none resize-none transition-colors"
          />
        </section>

        {/* Medications & Health */}
        <section className="bg-[#181c24] p-3.5 rounded-xl micro-border space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">
                medication
              </span>
              Health & Meds
            </h3>
            <span className="text-[10px] text-[#8c909f]">Daily Schedule</span>
          </div>

          <div className="space-y-1.5">
            {medications.map((med) => (
              <div
                key={med.id}
                onClick={() => onToggleMedication(med.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-[#10141d] hover:bg-[#1f2430] micro-border cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      med.takenToday
                        ? 'bg-[#4edea3] border-[#4edea3] text-[#003822]'
                        : 'border-[#424754]'
                    }`}
                  >
                    {med.takenToday && (
                      <span className="material-symbols-outlined text-[12px] font-bold">
                        check
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        med.takenToday ? 'line-through text-[#8c909f]' : 'text-[#dfe2ee]'
                      }`}
                    >
                      {med.name}
                    </p>
                    <p className="text-[10px] text-[#8c909f]">{med.dosage}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#adc6ff] font-mono">{med.timeStr || (med as any).time || ''}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Upcoming Events Agenda */}
      <section className="bg-[#181c24] p-3.5 rounded-xl micro-border space-y-2">
        <h3 className="text-xs font-bold text-[#dfe2ee] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">
            event_upcoming
          </span>
          Upcoming Life Events
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {events.map((evt) => {
            const dateVal = evt.dateStr || (evt as any).date || '';
            const dateParts = dateVal ? dateVal.split(' ') : ['', ''];
            const monthPart = dateParts[0] || '';
            const dayPart = dateParts[1] || '';
            const timeVal = evt.timeStr || (evt as any).time || '';

            return (
              <div
                key={evt.id}
                className="p-2.5 bg-[#10141d] rounded-lg micro-border flex items-center gap-3"
              >
                <div className="px-2.5 py-1.5 rounded-lg bg-[#adc6ff]/10 text-[#adc6ff] font-bold text-xs flex items-center justify-center gap-1 shrink-0 whitespace-nowrap">
                  <span className="uppercase">{monthPart}</span>
                  <span className="font-mono">{dayPart}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#dfe2ee] truncate">{evt.title}</p>
                  <p className="text-[10px] text-[#8c909f]">{timeVal}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
