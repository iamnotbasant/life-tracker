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
    walks: [
      {
        id: 'seed-walk-1',
        title: 'Campus Stroll',
        time: '18:30',
        distanceKm: 1.2,
        durationMin: 20,
        steps: 1697,
        calories: 73,
        avgBpm: 92,
      },
    ],
    workouts: [],
    weight: 48.9,
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

  // 2026-10-03 (Today)
  days['2026-10-03'] = {
    date: '2026-10-03',
    steps: 6420,
    sleep: {
      sleepStart: '23:30',
      sleepEnd: '07:30',
      sleepHours: 8,
    },
    meals: [
      {
        id: 'seed-meal-6',
        time: '08:45',
        mealType: 'breakfast',
        description: 'Oatmeal with banana, peanut butter & 350ml milk',
        calories: 580,
        protein: 26,
      },
      {
        id: 'seed-meal-7',
        time: '13:30',
        mealType: 'lunch',
        description: 'Paneer bhurji, 4 roti, dal tadka + curd',
        calories: 920,
        protein: 42,
      },
      {
        id: 'seed-meal-8',
        time: '17:30',
        mealType: 'snack',
        description: 'Sprouted moong chaat + roasted almonds',
        calories: 340,
        protein: 16,
      },
    ],
    walks: [
      {
        id: 'seed-walk-today',
        title: 'Morning Park Walk',
        time: '07:45',
        distanceKm: 3.5,
        durationMin: 42,
        steps: 4600,
        calories: 198,
        avgBpm: 98,
        notes: 'Brisk fresh air walk',
      },
    ],
    workouts: [
      {
        id: 'seed-workout-today',
        name: 'Calisthenics Push & Dips',
        type: 'calisthenics',
        durationMin: 45,
        calories: 220,
        time: '18:00',
        exercises: [
          { name: 'Parallel Bar Dips', sets: 4, reps: 10, notes: 'Full depth' },
          { name: 'Push-ups (Diamond & Normal)', sets: 4, reps: 15 },
          { name: 'Pike Push-ups', sets: 3, reps: 8, notes: 'Handstand progression' },
          { name: 'Hanging Leg Raises', sets: 3, reps: 12 },
        ],
        notes: 'Good form on dips, felt explosive',
      },
    ],
    weight: 48.9,
    points: 37,
    pointsBreakdown: {
      caloriesPts: 0,
      proteinPts: 10,
      stepsPts: 2,
      workoutPts: 10,
      sleepPts: 15,
      weightPts: 5,
      streakPts: 0,
      total: 42,
      notes: [
        'Calories: 1840 kcal logged so far (on track for 2500)',
        'Protein: 84g logged (+10 pts)',
        'Steps: 6,420 (+2 pts)',
        'Workout: Calisthenics Push (45m) (+10 pts)',
        'Sleep: 8h asleep by 23:30 (+15 pts)',
        'Weight: 48.9 kg logged (+5 pts)',
      ],
    },
  };

  // Also pre-seed a couple of past historical days so the yearly heatmaps have historical depth
  const pastSeedDates = [
    { date: '2026-09-30', steps: 8400, kcal: 2380, protein: 88, workout: true },
    { date: '2026-09-29', steps: 10250, kcal: 2510, protein: 92, workout: true },
    { date: '2026-09-28', steps: 7200, kcal: 2290, protein: 82, workout: false },
    { date: '2026-09-27', steps: 11100, kcal: 2580, protein: 96, workout: true },
    { date: '2026-09-26', steps: 9400, kcal: 2420, protein: 87, workout: true },
    { date: '2026-09-25', steps: 6100, kcal: 2150, protein: 74, workout: false },
    { date: '2026-09-24', steps: 10400, kcal: 2490, protein: 90, workout: true },
    { date: '2026-09-23', steps: 8900, kcal: 2340, protein: 86, workout: true },
    { date: '2026-09-22', steps: 7800, kcal: 2260, protein: 80, workout: false },
    { date: '2026-09-21', steps: 10800, kcal: 2520, protein: 94, workout: true },
    { date: '2026-09-20', steps: 9100, kcal: 2410, protein: 85, workout: true },
    { date: '2026-09-19', steps: 5800, kcal: 2100, protein: 70, workout: false },
    { date: '2026-09-18', steps: 10200, kcal: 2500, protein: 91, workout: true },
  ];

  for (const s of pastSeedDates) {
    days[s.date] = {
      date: s.date,
      steps: s.steps,
      sleep: { sleepHours: 7.5, sleepStart: '23:30', sleepEnd: '07:00' },
      meals: [
        {
          id: `seed-meal-hist-${s.date}`,
          mealType: 'lunch',
          description: 'Daily balanced meals & shakes',
          calories: s.kcal,
          protein: s.protein,
          time: '13:00',
        },
      ],
      walks: [
        {
          id: `seed-walk-hist-${s.date}`,
          title: 'Daily Walk',
          time: '18:00',
          distanceKm: +(s.steps * 0.00075).toFixed(2),
          durationMin: Math.round(s.steps / 95),
          steps: s.steps,
          calories: Math.round(s.steps * 0.043),
        },
      ],
      workouts: s.workout
        ? [
            {
              id: `seed-wo-hist-${s.date}`,
              name: 'Calisthenics Training',
              type: 'calisthenics',
              durationMin: 45,
              calories: 220,
              time: '17:30',
              exercises: [{ name: 'Pull-ups / Dips / Core', sets: 4, reps: 10 }],
            },
          ]
        : [],
      points: s.workout && s.steps >= 10000 && s.protein >= 85 ? 40 : 25,
    };
  }

  const weightHistory: WeightEntry[] = [
    { id: 'w-1', date: '2026-09-15', weightKg: 48.2, note: 'Starting tracker baseline' },
    { id: 'w-2', date: '2026-09-22', weightKg: 48.5, note: 'Gaining steady lean mass' },
    { id: 'w-3', date: '2026-09-29', weightKg: 48.8, note: 'Calisthenics strength up' },
    { id: 'w-4', date: '2026-10-01', weightKg: 48.9, note: 'Consistency in surplus' },
    { id: 'w-5', date: '2026-10-03', weightKg: 48.9, note: 'Current target check' },
  ];

  return {
    profile: DEFAULT_PROFILE,
    days,
    weightHistory,
    activeDate: '2026-10-03',
    onboardingCompleted: false, // will show onboarding on fresh launch
  };
}
