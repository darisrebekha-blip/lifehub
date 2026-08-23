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

export const INITIAL_PROFILE: UserProfileData = {
  name: 'User',
  greetingPrefix: 'Good morning',
  avatarUrl: '',
  location: 'Add City',
  temperature: '28°C',
  tempC: 28,
  tempF: 82,
  tempUnit: 'C',
  weatherCondition: 'Sunny',
  weatherIconSymbol: 'wb_sunny',
  currencySymbol: '$'
};

export const INITIAL_TASKS: TaskItem[] = [
  { id: '1', title: 'Add tasks here', priority: 'LOW', completed: false, category: 'General' }
];

export const INITIAL_WATER: WaterIntakeData = {
  currentLiters: 0,
  targetLiters: 2.5,
  history: []
};

export const INITIAL_STEPS: StepsData = {
  currentSteps: 0,
  targetSteps: 10000,
  caloriesBurned: 0,
  distanceKm: 0,
  history: []
};

export const INITIAL_HABITS: HabitItem[] = [
  { id: 'h1', name: 'Habit', streaks: [true, true, false, false, false], targetPerWeek: 5 },
  { id: 'h2', name: 'Meditation', streaks: [false, false, false, false, false], targetPerWeek: 5 }
];

export const INITIAL_UPCOMING_EVENTS: UpcomingEventItem[] = [
  { id: 'e1', title: 'New Year', dateStr: 'JAN 01', timeStr: 'Holiday', category: 'Holiday' },
  { id: 'e2', title: 'Add event', dateStr: 'DATE', timeStr: 'Time', category: 'General' }
];

export const INITIAL_MEDICATIONS: MedicationItem[] = [
  { id: 'm1', name: 'Add tablets', timeStr: 'Daily', takenToday: false }
];

export const INITIAL_FINANCE: FinanceData = {
  monthlyBudget: 0,
  spent: 0,
  transactions: []
};

export const INITIAL_SCRATCHPAD: QuickNoteData = {
  content: '',
  lastUpdated: 'Just now'
};

export const DAILY_QUOTES = [
  'Focus on progress, not perfection.',
  'Small daily disciplines compound into massive long-term success.',
  'Your daily habits sculpt your future reality.',
  'Simplify your routine, amplify your results.',
  'Stay hydrated, stay centered, stay unstoppable.',
  'Each step forward is a victory in momentum.',
  'Master your day by mastering your morning.'
];
