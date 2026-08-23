export type Priority = 'HIGH' | 'MED' | 'LOW';

export interface TaskItem {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  category?: string;
  dueDate?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  // 5-day streak array (true = done, false = not done)
  streaks: boolean[];
  targetPerWeek: number;
}

export interface WaterIntakeData {
  currentLiters: number;
  targetLiters: number;
  history: { timestamp: string; amountMl: number }[];
}

export interface StepsData {
  currentSteps: number;
  targetSteps: number;
  caloriesBurned: number;
  distanceKm: number;
  history: { timestamp: string; steps: number }[];
}

export interface UpcomingEventItem {
  id: string;
  title: string;
  dateStr: string; // e.g. "NOV 14"
  timeStr: string; // e.g. "10:00 AM - 11:30 AM"
  category?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  timeStr: string;
  takenToday: boolean;
}

export interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: string;
}

export interface FinanceData {
  monthlyBudget: number;
  spent: number;
  transactions: TransactionItem[];
}

export interface QuickNoteData {
  content: string;
  lastUpdated: string;
}

export interface UserProfileData {
  name: string;
  greetingPrefix: string;
  avatarUrl: string;
  location: string;
  temperature: string;
  tempC: number;
  tempF: number;
  tempUnit: 'C' | 'F';
  weatherCondition: string;
  weatherIconSymbol: string;
  currencySymbol: string;
}

export type NavigationTab = 'home' | 'tasks' | 'money' | 'habits' | 'more';

export interface AICommandResult {
  actionType: 'add_task' | 'add_expense' | 'log_water' | 'log_steps' | 'add_habit' | 'update_scratchpad' | 'general_response';
  summary: string;
  taskPayload?: { title: string; priority: Priority };
  expensePayload?: { title: string; amount: number; category: string };
  waterAmountMl?: number;
  stepCount?: number;
  scratchpadPayload?: string;
}
