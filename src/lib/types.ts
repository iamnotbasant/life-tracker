export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealEntry {
  id: string;
  mealType: MealType;
  description: string;
  calories: number;
  protein: number;
  time: string;
}

export interface WalkSession {
  id: string;
  title: string;
  time: string;
  distanceKm: number;
  durationMin: number;
  steps: number;
  calories: number;
  avgBpm?: number;
  notes?: string;
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  notes?: string;
}

export interface WorkoutEntry {
  id: string;
  name: string;
  type: 'calisthenics' | 'cardio' | 'mobility' | 'strength' | 'other';
  durationMin: number;
  calories: number;
  time: string;
  exercises?: WorkoutExercise[];
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface SleepData {
  sleepStart?: string;
  sleepEnd?: string;
  sleepHours?: number;
}

export interface PointsBreakdown {
  caloriesPts: number;
  proteinPts: number;
  stepsPts: number;
  workoutPts: number;
  sleepPts: number;
  weightPts: number;
  streakPts: number;
  total: number;
  notes: string[];
}

export interface DayData {
  date: string; // YYYY-MM-DD
  steps: number;
  stepsNote?: string;
  sleep?: SleepData;
  meals: MealEntry[];
  walks: WalkSession[];
  workouts: WorkoutEntry[];
  weight?: number;
  points: number;
  pointsBreakdown?: PointsBreakdown;
}

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  goal: 'weight_gain' | 'maintain' | 'cut';
  calorieGoalMaintain: number;
  calorieGoalGain: number;
  proteinGoalMin: number;
  proteinGoalMax: number;
  stepsGoal: number;
  bedtimeGoal: string;
  timezone: string;
  stepCalorieFactor: number; // e.g. 0.043 kcal per step
}

export interface AppState {
  profile: UserProfile;
  days: Record<string, DayData>;
  weightHistory: WeightEntry[];
  activeDate: string; // YYYY-MM-DD
  onboardingCompleted: boolean;
}

export type TabType = 'home' | 'steps' | 'workout' | 'meals' | 'calories' | 'weight' | 'history' | 'sleep' | 'settings';
