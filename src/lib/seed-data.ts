import { AppState, DayData, UserProfile, WeightEntry } from './types';

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

export function getInitialSeedData(): AppState {
  const days: Record<string, DayData> = {};

  // Exact backup for 2026-10-01
  days['2026-10-01'] = {
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
    workouts: [],
    points: -13,
    pointsBreakdown: {
      caloriesPts: -8,
      proteinPts: -5,
      stepsPts: -5,
      workoutPts: 0,
      sleepPts: 5,
      weightPts: 0,
      streakPts: 0,
      total: -13,
      notes: [
        'Calories: 1815 kcal (-8 pts)',
        'Protein: 62g (-5 pts)',
        'Steps: 1697 (-5 pts)',
        'Sleep: 7h (+5 pts)',
      ],
    },
  };

  // Exact backup for 2026-10-02
  days['2026-10-02'] = {
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
    workouts: [],
    points: -23,
    pointsBreakdown: {
      caloriesPts: -8,
      proteinPts: -5,
      stepsPts: 0,
      workoutPts: 0,
      sleepPts: -10,
      weightPts: 0,
      streakPts: 0,
      total: -23,
      notes: [
        'Calories: 1155 kcal (-8 pts)',
        'Protein: 37g (-5 pts)',
        'Steps: Not logged (0 pts)',
        'Sleep: 4.5h (-10 pts, short duration & late bedtime)',
      ],
    },
  };

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
