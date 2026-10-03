import { AppState, DayData, UserProfile, WeightEntry, WorkoutEntry } from './types';
import { calculateDayPoints } from './points';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Basant',
  weightKg: 48.9,
  heightCm: 165,
  age: 21,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'weight_gain',
  calorieGoalMaintain: 2300,
  calorieGoalGain: 2500,
  proteinGoalMin: 85,
  proteinGoalMax: 100,
  stepsGoal: 10000,
  bedtimeGoal: '23:30',
  timezone: 'Asia/Kolkata',
  stepCalorieFactor: 0.043, // 43 kcal per 1000 steps at 48.9 kg
};

export const SEED_WORKOUT_OCT_01: WorkoutEntry = {
  id: 'seed-wo-1',
  name: 'Calisthenics',
  type: 'calisthenics',
  time: '18:21',
  durationMin: 5,
  calories: 0,
  exercises: [
    { name: 'Standard Push-ups', sets: 3, reps: 1 },
    { name: 'Incline Push-ups', sets: 3, reps: 1 },
    { name: 'Chair Dips', sets: 3, reps: 1 },
    { name: 'Pike Push-ups', sets: 3, reps: 1 },
  ],
};

export const SEED_WORKOUT_OCT_02: WorkoutEntry = {
  id: 'seed-wo-2',
  name: 'Calisthenics',
  type: 'calisthenics',
  time: '18:48',
  durationMin: 8,
  calories: 0,
  exercises: [
    { name: 'Pull-ups', sets: 3, reps: 1 },
    { name: 'Chin-ups', sets: 3, reps: 1 },
    { name: 'Bar Hang', sets: 3, reps: 5, notes: '5 seconds per set' },
    { name: 'Bicep Curls', sets: 3, reps: 1, weight: '3 kg' },
  ],
};

export function getInitialSeedData(): AppState {
  const days: Record<string, DayData> = {};

  // Exact backup for 2026-10-01
  const day1: DayData = {
    date: '2026-10-01',
    steps: 1697,
    sleep: {
      sleepStart: '01:40',
      sleepEnd: '08:41',
      sleepHours: 7,
    },
    meals: [
      {
        id: 'seed-meal-1',
        time: '09:30',
        mealType: 'breakfast',
        description: '300ml doodh (toned)',
        calories: 180,
        protein: 9.5,
      },
      {
        id: 'seed-meal-2',
        time: '13:00',
        mealType: 'lunch',
        description: 'chole sabzi (1 katori) + 5 roti + 2 sooji laddu + 1 katori dahi',
        calories: 1125,
        protein: 35,
      },
      {
        id: 'seed-meal-3',
        time: '21:00',
        mealType: 'dinner',
        description: 'chane sabzi (thodi) + 2 paranthe + 1 katori dahi',
        calories: 510,
        protein: 17.5,
      },
    ],
    walks: [],
    workouts: [SEED_WORKOUT_OCT_01],
    points: 0,
  };
  const d1Points = calculateDayPoints(day1, DEFAULT_PROFILE, 0);
  day1.points = d1Points.total;
  day1.pointsBreakdown = d1Points;
  days['2026-10-01'] = day1;

  // Exact backup for 2026-10-02
  const day2: DayData = {
    date: '2026-10-02',
    steps: 0,
    stepsNote: 'not logged',
    sleep: {
      sleepStart: '03:40',
      sleepEnd: '08:11',
      sleepHours: 4.5,
    },
    meals: [
      {
        id: 'seed-meal-4',
        time: '10:10',
        mealType: 'snack',
        description: '2 sooji laddu',
        calories: 315,
        protein: 3.5,
      },
      {
        id: 'seed-meal-5',
        time: '21:00',
        mealType: 'dinner',
        description: '5 roti + 2 katori dal',
        calories: 840,
        protein: 33.5,
      },
    ],
    walks: [],
    workouts: [SEED_WORKOUT_OCT_02],
    points: 0,
  };
  const d2Points = calculateDayPoints(day2, DEFAULT_PROFILE, 0);
  day2.points = d2Points.total;
  day2.pointsBreakdown = d2Points;
  days['2026-10-02'] = day2;

  // 2026-10-03 (today) — starts empty; the user logs their own data
  days['2026-10-03'] = {
    date: '2026-10-03',
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  // Only the user's real measured entry — no fabricated history
  const weightHistory: WeightEntry[] = [
    { id: 'w-1', date: '2026-10-02', weightKg: 48.9, note: 'Measured' },
  ];

  return {
    profile: DEFAULT_PROFILE,
    days,
    weightHistory,
    activeDate: '2026-10-03',
    onboardingCompleted: false, // will show onboarding on fresh launch
  };
}
