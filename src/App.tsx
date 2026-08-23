import { useState, useEffect } from 'react';
import {
  UserProfileData,
  TaskItem,
  WaterIntakeData,
  StepsData,
  HabitItem,
  UpcomingEventItem,
  MedicationItem,
  FinanceData,
  QuickNoteData,
  NavigationTab,
  Priority,
  TransactionItem,
  AICommandResult
} from './types';
import {
  INITIAL_PROFILE,
  INITIAL_TASKS,
  INITIAL_WATER,
  INITIAL_STEPS,
  INITIAL_HABITS,
  INITIAL_UPCOMING_EVENTS,
  INITIAL_MEDICATIONS,
  INITIAL_FINANCE,
  INITIAL_SCRATCHPAD
} from './data/initialData';

import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  User
} from './lib/firebase';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { TasksView } from './components/TasksView';
import { MoneyView } from './components/MoneyView';
import { HabitsView } from './components/HabitsView';
import { MoreView } from './components/MoreView';
import { NewItemModal } from './components/NewItemModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthModal } from './components/AuthModal';
import { ClimateModal } from './components/ClimateModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isClimateModalOpen, setIsClimateModalOpen] = useState(false);

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lifehub_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('lifehub_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core LifeHub States with LocalStorage Persistence & Version Migration
  const STORAGE_VERSION = 'v2_clean_defaults';

  const [profile, setProfile] = useState<UserProfileData>(() => {
    const version = localStorage.getItem('lifehub_version');
    if (version !== STORAGE_VERSION) {
      localStorage.setItem('lifehub_version', STORAGE_VERSION);
      localStorage.setItem('lifehub_profile', JSON.stringify(INITIAL_PROFILE));
      localStorage.setItem('lifehub_tasks', JSON.stringify(INITIAL_TASKS));
      localStorage.setItem('lifehub_water', JSON.stringify(INITIAL_WATER));
      localStorage.setItem('lifehub_steps', JSON.stringify(INITIAL_STEPS));
      localStorage.setItem('lifehub_habits', JSON.stringify(INITIAL_HABITS));
      localStorage.setItem('lifehub_medications', JSON.stringify(INITIAL_MEDICATIONS));
      localStorage.setItem('lifehub_events', JSON.stringify(INITIAL_UPCOMING_EVENTS));
      localStorage.setItem('lifehub_finance', JSON.stringify(INITIAL_FINANCE));
      localStorage.setItem('lifehub_scratchpad', JSON.stringify(INITIAL_SCRATCHPAD));
      return INITIAL_PROFILE;
    }
    const saved = localStorage.getItem('lifehub_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('lifehub_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [water, setWater] = useState<WaterIntakeData>(() => {
    const saved = localStorage.getItem('lifehub_water');
    return saved ? JSON.parse(saved) : INITIAL_WATER;
  });

  const [steps, setSteps] = useState<StepsData>(() => {
    const saved = localStorage.getItem('lifehub_steps');
    return saved ? JSON.parse(saved) : INITIAL_STEPS;
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('lifehub_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [events] = useState<UpcomingEventItem[]>(() => {
    const saved = localStorage.getItem('lifehub_events');
    return saved ? JSON.parse(saved) : INITIAL_UPCOMING_EVENTS;
  });

  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    const saved = localStorage.getItem('lifehub_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [finance, setFinance] = useState<FinanceData>(() => {
    const saved = localStorage.getItem('lifehub_finance');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE;
  });

  const [scratchpad, setScratchpad] = useState<QuickNoteData>(() => {
    const saved = localStorage.getItem('lifehub_scratchpad');
    return saved ? JSON.parse(saved) : INITIAL_SCRATCHPAD;
  });

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or create user root doc in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const newProf = {
            ...profile,
            name: user.displayName || user.email?.split('@')[0] || profile.name
          };
          await setDoc(userDocRef, {
            profile: newProf,
            finance: finance,
            water: water,
            scratchpad: scratchpad
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Sync when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    // Sync profile & scratchpad doc
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile) setProfile(data.profile);
        if (data.finance) setFinance(data.finance);
        if (data.water) setWater(data.water);
        if (data.steps) setSteps(data.steps);
        if (data.scratchpad) setScratchpad(data.scratchpad);
      }
    });

    // Sync tasks collection
    const tasksColRef = collection(db, 'users', currentUser.uid, 'tasks');
    const unsubTasks = onSnapshot(tasksColRef, (colSnap) => {
      const remoteTasks: TaskItem[] = [];
      colSnap.forEach((d) => remoteTasks.push({ id: d.id, ...d.data() } as TaskItem));
      if (remoteTasks.length > 0) setTasks(remoteTasks);
    });

    // Sync habits collection
    const habitsColRef = collection(db, 'users', currentUser.uid, 'habits');
    const unsubHabits = onSnapshot(habitsColRef, (colSnap) => {
      const remoteHabits: HabitItem[] = [];
      colSnap.forEach((d) => remoteHabits.push({ id: d.id, ...d.data() } as HabitItem));
      if (remoteHabits.length > 0) setHabits(remoteHabits);
    });

    return () => {
      unsubDoc();
      unsubTasks();
      unsubHabits();
    };
  }, [currentUser]);

  // Save states to localStorage for offline / guest backup
  useEffect(() => {
    localStorage.setItem('lifehub_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lifehub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lifehub_water', JSON.stringify(water));
  }, [water]);

  useEffect(() => {
    localStorage.setItem('lifehub_steps', JSON.stringify(steps));
  }, [steps]);

  useEffect(() => {
    localStorage.setItem('lifehub_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lifehub_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('lifehub_finance', JSON.stringify(finance));
  }, [finance]);

  useEffect(() => {
    localStorage.setItem('lifehub_scratchpad', JSON.stringify(scratchpad));
  }, [scratchpad]);

  // Helper to persist in Firestore if logged in
  const syncUserDoc = async (field: string, value: any) => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { [field]: value }, { merge: true });
      } catch (e) {
        console.warn('Firestore sync warning:', e);
      }
    }
  };

  // Actions
  const handleToggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      if (currentUser) {
        const t = updated.find((x) => x.id === id);
        if (t) {
          setDoc(doc(db, 'users', currentUser.uid, 'tasks', id), t, { merge: true });
        }
      }
      return updated;
    });
  };

  const handleAddTask = (taskData: { title: string; priority: Priority; category?: string }) => {
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: taskData.title,
      priority: taskData.priority,
      completed: false,
      category: taskData.category || 'General'
    };
    setTasks((prev) => [newTask, ...prev]);
    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'tasks', newTask.id), newTask);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddWater = (amountMl: number) => {
    const addedLiters = amountMl / 1000;
    setWater((prev) => {
      const updated = {
        ...prev,
        currentLiters: Number((prev.currentLiters + addedLiters).toFixed(2)),
        history: [
          { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amountMl },
          ...prev.history
        ]
      };
      syncUserDoc('water', updated);
      return updated;
    });
  };

  const handleAddSteps = (count: number) => {
    setSteps((prev) => {
      const newSteps = Math.max(0, prev.currentSteps + count);
      const updated: StepsData = {
        ...prev,
        currentSteps: newSteps,
        caloriesBurned: Math.round(newSteps * 0.04),
        distanceKm: Number((newSteps * 0.00075).toFixed(2)),
        history: [
          { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), steps: count },
          ...prev.history
        ]
      };
      syncUserDoc('steps', updated);
      return updated;
    });
  };

  const handleUpdateStepTarget = (target: number) => {
    setSteps((prev) => {
      const updated = { ...prev, targetSteps: Math.max(100, target) };
      syncUserDoc('steps', updated);
      return updated;
    });
  };

  const handleToggleHabitStreak = (habitId: string, dayIndex: number) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id === habitId) {
          const newStreaks = [...h.streaks];
          newStreaks[dayIndex] = !newStreaks[dayIndex];
          return { ...h, streaks: newStreaks };
        }
        return h;
      });
      if (currentUser) {
        const h = updated.find((x) => x.id === habitId);
        if (h) setDoc(doc(db, 'users', currentUser.uid, 'habits', habitId), h);
      }
      return updated;
    });
  };

  const handleAddHabit = (name: string, targetPerWeek: number) => {
    const newHabit: HabitItem = {
      id: 'h_' + Date.now(),
      name,
      streaks: [false, false, false, false, false],
      targetPerWeek
    };
    setHabits((prev) => [...prev, newHabit]);
    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'habits', newHabit.id), newHabit);
    }
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleToggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, takenToday: !m.takenToday } : m))
    );
  };

  const handleAddTransaction = (tData: Omit<TransactionItem, 'id' | 'date'>) => {
    const newTrans: TransactionItem = {
      id: 't_' + Date.now(),
      title: tData.title,
      amount: tData.amount,
      type: tData.type,
      category: tData.category,
      date: 'Today'
    };
    setFinance((prev) => {
      const newSpent = tData.type === 'expense' ? prev.spent + tData.amount : prev.spent;
      const updated = {
        ...prev,
        spent: newSpent,
        transactions: [newTrans, ...prev.transactions]
      };
      syncUserDoc('finance', updated);
      return updated;
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setFinance((prev) => {
      const targetTrans = prev.transactions.find((t) => t.id === id);
      const newTransactions = prev.transactions.filter((t) => t.id !== id);
      let newSpent = prev.spent;
      if (targetTrans && targetTrans.type === 'expense') {
        newSpent = Math.max(0, prev.spent - targetTrans.amount);
      }
      const updated = {
        ...prev,
        spent: newSpent,
        transactions: newTransactions
      };
      syncUserDoc('finance', updated);
      return updated;
    });
  };

  const handleUpdateBudget = (newBudget: number) => {
    setFinance((prev) => {
      const updated = { ...prev, monthlyBudget: newBudget };
      syncUserDoc('finance', updated);
      return updated;
    });
  };

  const handleUpdateScratchpad = (content: string) => {
    const updated = {
      content,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setScratchpad(updated);
    syncUserDoc('scratchpad', updated);
  };

  const handleUpdateProfile = (updated: Partial<UserProfileData>) => {
    setProfile((prev) => {
      const newProf = { ...prev, ...updated };
      syncUserDoc('profile', newProf);
      return newProf;
    });
  };

  // Execute AI Commands from server or fallback
  const handleExecuteAiCommand = async (command: string): Promise<AICommandResult> => {
    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          contextState: {
            taskCount: tasks.length,
            waterLiters: water.currentLiters,
            financeSpent: finance.spent,
            financeBudget: finance.monthlyBudget
          }
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const resJson: AICommandResult = await response.json();

      // Apply structural updates based on AI result
      if (resJson.actionType === 'add_task' && resJson.taskPayload) {
        handleAddTask({
          title: resJson.taskPayload.title,
          priority: resJson.taskPayload.priority || 'MED'
        });
      } else if (resJson.actionType === 'add_expense' && resJson.expensePayload) {
        handleAddTransaction({
          title: resJson.expensePayload.title,
          amount: resJson.expensePayload.amount,
          type: 'expense',
          category: resJson.expensePayload.category || 'General'
        });
      } else if (resJson.actionType === 'log_water' && resJson.waterAmountMl) {
        handleAddWater(resJson.waterAmountMl);
      } else if (resJson.actionType === 'log_steps' && resJson.stepCount) {
        handleAddSteps(resJson.stepCount);
      } else if (resJson.actionType === 'update_scratchpad' && resJson.scratchpadPayload) {
        handleUpdateScratchpad(
          scratchpad.content
            ? scratchpad.content + '\n' + resJson.scratchpadPayload
            : resJson.scratchpadPayload
        );
      }

      return resJson;
    } catch (err) {
      // Local smart command parser as reliable fallback
      const lower = command.toLowerCase();

      if (lower.includes('task') || lower.includes('todo')) {
        const titleMatch = command.replace(/add task|add todo|create task/i, '').trim() || 'New AI Task';
        const priority: Priority = lower.includes('high') ? 'HIGH' : lower.includes('low') ? 'LOW' : 'MED';
        handleAddTask({ title: titleMatch, priority });
        return {
          actionType: 'add_task',
          summary: `Added new task: "${titleMatch}" [${priority}]`,
          taskPayload: { title: titleMatch, priority }
        };
      }

      if (lower.includes('water') || lower.includes('drank')) {
        handleAddWater(250);
        return {
          actionType: 'log_water',
          summary: 'Logged +250ml water intake to your daily progress!',
          waterAmountMl: 250
        };
      }

      if (lower.includes('step') || lower.includes('walk') || lower.includes('jog')) {
        const numMatch = command.match(/\b\d+\b/);
        const stepsToAdd = numMatch ? parseInt(numMatch[0], 10) : 1000;
        handleAddSteps(stepsToAdd);
        return {
          actionType: 'log_steps',
          summary: `Logged +${stepsToAdd.toLocaleString()} footsteps to your daily fitness goal!`,
          stepCount: stepsToAdd
        };
      }

      if (lower.includes('$') || lower.includes('expense') || lower.includes('log')) {
        const amountMatch = command.match(/\$?(\d+(\.\d+)?)/);
        const amountNum = amountMatch ? parseFloat(amountMatch[1]) : 20;
        handleAddTransaction({
          title: 'Quick AI Log',
          amount: amountNum,
          type: 'expense',
          category: 'AI Command'
        });
        return {
          actionType: 'add_expense',
          summary: `Logged $${amountNum} expense to your LifeHub finance tracker!`,
          expensePayload: { title: 'Quick AI Log', amount: amountNum, category: 'AI Command' }
        };
      }

      return {
        actionType: 'general_response',
        summary: `LifeHub Assistant analyzed your command: "${command}". All systems are operational and on track!`
      };
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    setProfile(INITIAL_PROFILE);
    setTasks(INITIAL_TASKS);
    setWater(INITIAL_WATER);
    setSteps(INITIAL_STEPS);
    setHabits(INITIAL_HABITS);
    setMedications(INITIAL_MEDICATIONS);
    setFinance(INITIAL_FINANCE);
    setScratchpad(INITIAL_SCRATCHPAD);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#dfe2ee] font-sans antialiased flex flex-col selection:bg-[#4d8eff]/30 selection:text-white">
      {/* Top Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectTab={setActiveTab}
        onOpenSearch={() => {
          setActiveTab('home');
          const input = document.getElementById('home-search-input');
          if (input) input.focus();
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Main View Area */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            tasks={tasks}
            water={water}
            steps={steps}
            habits={habits}
            events={events}
            medications={medications}
            finance={finance}
            scratchpad={scratchpad}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleTask={handleToggleTask}
            onAddWater={handleAddWater}
            onAddSteps={handleAddSteps}
            onUpdateStepTarget={handleUpdateStepTarget}
            onToggleHabitStreak={handleToggleHabitStreak}
            onToggleMedication={handleToggleMedication}
            onUpdateScratchpad={handleUpdateScratchpad}
            onOpenNewModal={() => setIsNewModalOpen(true)}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenClimateModal={() => setIsClimateModalOpen(true)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'money' && (
          <MoneyView
            finance={finance}
            currencySymbol={profile.currencySymbol}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            onToggleStreak={handleToggleHabitStreak}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'more' && (
          <MoreView
            scratchpad={scratchpad}
            profile={profile}
            onUpdateScratchpad={handleUpdateScratchpad}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenClimateModal={() => setIsClimateModalOpen(true)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Website Footer Attribution */}
      <footer className="w-full py-5 pb-24 md:pb-8 border-t border-[#21262d] bg-[#0c1017] text-center">
        <p className="text-xs text-[#8c909f] flex items-center justify-center gap-1.5 flex-wrap">
          <span>Designed by</span>
          <span className="font-bold text-[#adc6ff] tracking-wide">
            DARIS REBEKHA S
          </span>
        </p>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Climate Modal */}
      <ClimateModal
        isOpen={isClimateModalOpen}
        profile={profile}
        onClose={() => setIsClimateModalOpen(false)}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Global Quick Action Modal */}
      <NewItemModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddTask={handleAddTask}
        onAddExpense={(expense) =>
          handleAddTransaction({
            title: expense.title,
            amount: expense.amount,
            type: 'expense',
            category: expense.category
          })
        }
        onAddHabit={handleAddHabit}
        onAddSteps={handleAddSteps}
        onAddNote={(note) =>
          handleUpdateScratchpad(
            scratchpad.content ? scratchpad.content + '\n' + note : note
          )
        }
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onExecuteAiCommand={handleExecuteAiCommand}
      />

      {/* Firebase Cloud Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
