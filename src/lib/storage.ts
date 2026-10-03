import { AppState, DayData, UserProfile, WeightEntry } from './types';
import { getInitialSeedData, SEED_WORKOUT_OCT_01, SEED_WORKOUT_OCT_02 } from './seed-data';
import { calculateDayPoints } from './points';

const STORAGE_KEY = 'life_tracker_app_state_v1';

// ---------------------------------------------------------------------------
// One-time cleanup for browsers that seeded from the v1 fabricated demo data
// (fake "today" meals/workout/walk + invented Sep 18-30 history + invented
// weight entries). Removes ONLY fabricated entries; user-logged entries
// (m-/wo-/w- timestamp ids) and the real 1-2 Oct seed are untouched.
// ---------------------------------------------------------------------------
const FAKE_SEED_DATES: string[] = (() => {
  const dates: string[] = [];
  for (let d = 18; d <= 30; d++) dates.push(`2026-09-${d}`);
  return dates;
})();

function isFakeSeedId(id: string): boolean {
  return (
    id === 'seed-meal-6' ||
    id === 'seed-meal-7' ||
    id === 'seed-meal-8' ||
    id.startsWith('seed-meal-hist-') ||
    id === 'seed-walk-1' ||
    id === 'seed-walk-today' ||
    id.startsWith('seed-walk-hist-') ||
    id === 'seed-workout-today' ||
    id.startsWith('seed-wo-hist-')
  );
}

const FAKE_WEIGHT_NOTES = new Set([
  'Starting tracker baseline',
  'Gaining steady lean mass',
  'Calisthenics strength up',
  'Consistency in surplus',
  'Current target check',
]);

function migrateFabricatedSeed(state: AppState): { state: AppState; changed: boolean } {
  let changed = false;
  const days: Record<string, DayData> = { ...state.days };

  for (const [date, day] of Object.entries(days)) {
    if (FAKE_SEED_DATES.includes(date)) {
      delete days[date];
      changed = true;
      continue;
    }
    const meals = (day.meals || []).filter((m) => !isFakeSeedId(m.id));
    const walks = (day.walks || []).filter(
      (w) => !isFakeSeedId(w.id) && w.id !== 'seed-walk-1' && w.title !== 'Campus Stroll'
    );
    const workouts = (day.workouts || []).filter((w) => !isFakeSeedId(w.id));

    if (
      meals.length !== (day.meals || []).length ||
      walks.length !== (day.walks || []).length ||
      workouts.length !== (day.workouts || []).length
    ) {
      const cleaned: DayData = { ...day, meals, walks, workouts };
      try {
        const bd = calculateDayPoints(cleaned, state.profile);
        cleaned.points = bd.total;
        cleaned.pointsBreakdown = bd;
      } catch {
        /* keep existing points on failure */
      }
      days[date] = cleaned;
      changed = true;
    }
  }

  // Remove the user's manual "PULL-UPS & CORE" workout from Oct 1 (user asked to
  // remove it 2026-10-03; only the Fitness-Tracker workout stays).
  const day1manual = days['2026-10-01'];
  if (day1manual && (day1manual.workouts || []).some((w) => w.id === 'user-wo-oct1-pullups')) {
    const updatedDay1m: DayData = {
      ...day1manual,
      workouts: (day1manual.workouts || []).filter((w) => w.id !== 'user-wo-oct1-pullups'),
    };
    try {
      const bd = calculateDayPoints(updatedDay1m, state.profile);
      updatedDay1m.points = bd.total;
      updatedDay1m.pointsBreakdown = bd;
    } catch {
      /* keep existing points on failure */
    }
    days['2026-10-01'] = updatedDay1m;
    changed = true;
  }

  // Backfill the honest seed workout for Oct 1 if it is missing.
  // (The old version only added it when Oct 1 had NO workouts at all, so phones
  // where the user had already logged their own manual "PULL-UPS & CORE" session
  // never received the Fitness-Tracker workout. Both sessions are real.)
  const day1 = days['2026-10-01'];
  if (day1) {
    const workouts = day1.workouts || [];
    const mealIds = (day1.meals || []).map((m) => m.id);
    const hasSeedMeals =
      mealIds.includes('seed-meal-1') &&
      mealIds.includes('seed-meal-2') &&
      mealIds.includes('seed-meal-3');
    const hasFitnessTrackerWorkout = workouts.some((w) => w.id === 'seed-wo-1');
    if (!hasFitnessTrackerWorkout && hasSeedMeals) {
      const updatedDay1: DayData = {
        ...day1,
        workouts: [
          ...workouts,
          {
            ...SEED_WORKOUT_OCT_01,
            exercises: SEED_WORKOUT_OCT_01.exercises ? [...SEED_WORKOUT_OCT_01.exercises] : undefined,
          },
        ],
      };
      try {
        const bd = calculateDayPoints(updatedDay1, state.profile);
        updatedDay1.points = bd.total;
        updatedDay1.pointsBreakdown = bd;
      } catch {
        /* keep existing points on failure */
      }
      days['2026-10-01'] = updatedDay1;
      changed = true;
    }
  }

  const day2 = days['2026-10-02'];
  if (day2) {
    const workouts = day2.workouts || [];
    const mealIds = (day2.meals || []).map((m) => m.id);
    const hasSeedMeals =
      mealIds.includes('seed-meal-4') &&
      mealIds.includes('seed-meal-5');
    if (workouts.length === 0 && hasSeedMeals) {
      const updatedDay2: DayData = {
        ...day2,
        workouts: [
          {
            ...SEED_WORKOUT_OCT_02,
            exercises: SEED_WORKOUT_OCT_02.exercises ? [...SEED_WORKOUT_OCT_02.exercises] : undefined,
          },
        ],
      };
      try {
        const bd = calculateDayPoints(updatedDay2, state.profile);
        updatedDay2.points = bd.total;
        updatedDay2.pointsBreakdown = bd;
      } catch {
        /* keep existing points on failure */
      }
      days['2026-10-02'] = updatedDay2;
      changed = true;
    }
  }

  let weightHistory = state.weightHistory.filter((w) => !FAKE_WEIGHT_NOTES.has(w.note || ''));
  if (weightHistory.length !== state.weightHistory.length) changed = true;

  // Daily calorie goal bumped 2500 -> 2700 (only when still on the old default).
  if (state.profile.calorieGoalGain === 2500) {
    state.profile.calorieGoalGain = 2700;
    changed = true;
  }
  // Maintenance calories corrected 2300 -> 2350 (only when still on the old default).
  if (state.profile.calorieGoalMaintain === 2300) {
    state.profile.calorieGoalMaintain = 2350;
    changed = true;
  }

  // Drop phantom day.weight values that have no matching weightHistory entry.
  // (handleLogWeight is the only writer of day.weight and always writes a
  // weightHistory entry alongside it, so a day.weight without one is stale.)
  for (const [date, day] of Object.entries(days)) {
    if (
      day.weight !== undefined &&
      !weightHistory.some((w) => w.date === date)
    ) {
      const cleaned = { ...day };
      delete (cleaned as { weight?: number }).weight;
      days[date] = cleaned;
      changed = true;
    }
  }

  // Backfill honest MET-estimated calories on the two real seed workouts
  // (older browsers stored them with calories: 0).
  const SEED_WO_CALORIES: Record<string, number> = { 'seed-wo-1': 18, 'seed-wo-2': 29 };
  for (const day of Object.values(days)) {
    for (const w of day.workouts) {
      const honest = SEED_WO_CALORIES[w.id];
      if (honest !== undefined && w.calories !== honest) {
        w.calories = honest;
        changed = true;
      }
    }
  }
  // Oct 2 meal corrections (user-confirmed 2026-10-03):
  // - the "5 roti + 2 katori dal" logged as dinner was actually lunch (time unknown -> "--")
  // - real dinner was "2 roti + thodi dal"
  // - plus forgotten items: morning 1 laddu, 3 parathe + dahi, namkeen packet, biscuit packet
  //   (snack label values analysed from his packet photos; packet sizes estimated)
  const day2fix = days['2026-10-02'];
  if (day2fix) {
    const meals = [...(day2fix.meals || [])];
    let mealsChanged = false;
    const m5 = meals.find((m) => m.id === 'seed-meal-5');
    if (m5 && m5.mealType === 'dinner') {
      m5.mealType = 'lunch';
      m5.time = '--';
      mealsChanged = true;
    }
    const NEW_OCT2_MEALS = [
      { id: 'seed-meal-11', time: '--', mealType: 'breakfast', description: '1 sooji laddu', calories: 158, protein: 1.8 },
      { id: 'seed-meal-12', time: '--', mealType: 'lunch', description: '3 parathe + 1 katori dahi', calories: 590, protein: 15 },
      { id: 'seed-meal-14', time: '--', mealType: 'snack', description: 'namkeen packet (~20g)', calories: 102, protein: 0.9 },
      { id: 'seed-meal-15', time: '--', mealType: 'snack', description: 'Priyagold CNC biscuits (1 packet)', calories: 195, protein: 2.7 },
      { id: 'seed-meal-13', time: '--', mealType: 'dinner', description: '2 roti + thodi dal', calories: 270, protein: 9 },
    ] as const;
    for (const nm of NEW_OCT2_MEALS) {
      if (!meals.some((m) => m.id === nm.id)) {
        meals.push({ ...nm });
        mealsChanged = true;
      }
    }
    if (mealsChanged) {
      const updatedDay2 = { ...day2fix, meals };
      try {
        const bd = calculateDayPoints(updatedDay2, state.profile);
        updatedDay2.points = bd.total;
        updatedDay2.pointsBreakdown = bd;
      } catch {
        /* keep existing points on failure */
      }
      days['2026-10-02'] = updatedDay2;
      changed = true;
    }
  }

  // Weight corrections (user-confirmed): 48.9 kg was logged on Oct 1 (not Oct 2);
  // today's (Oct 3) weight is 50.05 kg.
  const seedWeightEntry = weightHistory.find(
    (w) => w.id === 'w-1' && w.note === 'Measured' && w.date === '2026-10-02'
  );
  if (seedWeightEntry) {
    seedWeightEntry.date = '2026-10-01';
    weightHistory.sort((a, b) => a.date.localeCompare(b.date));
    changed = true;
  }
  const oct1 = days['2026-10-01'];
  if (oct1 && oct1.weight === undefined) {
    days['2026-10-01'] = { ...oct1, weight: 48.9 };
    changed = true;
  }
  const hasOct3Weight =
    weightHistory.some((w) => w.date === '2026-10-03') ||
    (days['2026-10-03'] && days['2026-10-03'].weight !== undefined);
  if (!hasOct3Weight) {
    weightHistory = [
      ...weightHistory,
      { id: `w-seed-1003`, date: '2026-10-03', weightKg: 50.05, note: 'Measured' },
    ];
    weightHistory.sort((a, b) => a.date.localeCompare(b.date));
    const d3 = days['2026-10-03'] || {
      date: '2026-10-03',
      steps: 0,
      meals: [],
      walks: [],
      workouts: [],
      points: 0,
    };
    days['2026-10-03'] = { ...d3, weight: 50.05 };
    changed = true;
  }
  // Recompute points for the two weight-corrected days
  for (const d of ['2026-10-01', '2026-10-03']) {
    const day = days[d];
    if (!day) continue;
    try {
      const bd = calculateDayPoints(day, state.profile);
      day.points = bd.total;
      day.pointsBreakdown = bd;
    } catch {
      /* keep existing points on failure */
    }
  }

  // Oct 3 dummy-data cleanup (user-confirmed 2026-10-03): the v1 fabricated demo
  // seeded Oct 3 with fake sleep/steps/walks. The user logged NOTHING on Oct 3
  // except weight (50.05, added above), so strip the fabricated values.
  // Genuine user entries (non-fake ids, real logs) are left untouched.
  const d3 = days['2026-10-03'];
  if (d3) {
    let d3Changed = false;
    if ((d3.walks || []).length > 0) {
      d3.walks = [];
      d3Changed = true;
    }
    if ((d3.steps || 0) !== 0) {
      d3.steps = 0;
      d3Changed = true;
    }
    if (d3.stepsNote) {
      delete (d3 as { stepsNote?: string }).stepsNote;
      d3Changed = true;
    }
    // Only the exact fabricated v1 sleep pattern (23:30 -> 07:30)
    if (d3.sleep && d3.sleep.sleepStart === '23:30' && d3.sleep.sleepEnd === '07:30') {
      delete (d3 as { sleep?: unknown }).sleep;
      d3Changed = true;
    }
    if (d3Changed) {
      try {
        const bd = calculateDayPoints(d3, state.profile);
        d3.points = bd.total;
        d3.pointsBreakdown = bd;
      } catch {
        /* keep existing points on failure */
      }
      days['2026-10-03'] = d3;
      changed = true;
    }
  }

  // Final pass: recompute every day's points with the current 0-10 system.
  // (The scale changed from the old negative-friendly system; this is a no-op
  // once points already match.)
  for (const day of Object.values(days)) {
    try {
      const bd = calculateDayPoints(day, state.profile);
      if (day.points !== bd.total) {
        day.points = bd.total;
        day.pointsBreakdown = bd;
        changed = true;
      }
    } catch {
      /* keep existing points on failure */
    }
  }

  return { state: changed ? { ...state, days, weightHistory } : state, changed };
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialSeedData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.days || !parsed.profile) {
      const initial = getInitialSeedData();
      saveAppState(initial);
      return initial;
    }
    const { state: migrated, changed } = migrateFabricatedSeed(parsed);
    if (changed) saveAppState(migrated);
    return migrated;
  } catch (err) {
    console.error('Error loading app state from localStorage:', err);
    return getInitialSeedData();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving app state to localStorage:', err);
  }
}

export function exportBackupJSON(state: AppState): void {
  if (typeof window === 'undefined') return;

  const exportPayload = {
    backed_up: new Date().toISOString().split('T')[0],
    appName: 'Life Tracker',
    version: '1.0.0',
    profile: state.profile,
    days: state.days,
    weightHistory: state.weightHistory,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-tracker-backup-${exportPayload.backed_up}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseAndImportBackupJSON(jsonStr: string, currentState: AppState): AppState {
  const data = JSON.parse(jsonStr);

  const newDays = { ...currentState.days };
  const newProfile = { ...currentState.profile };
  const newWeightHistory = [...currentState.weightHistory];

  // If old backup format from health-tracker-data-backup.json
  if (data.days) {
    for (const [dateStr, dayObj] of Object.entries<any>(data.days)) {
      const existing = newDays[dateStr] || {
        date: dateStr,
        steps: 0,
        meals: [],
        walks: [],
        workouts: [],
        points: 0,
      };

      if (dayObj.basics) {
        if (dayObj.basics.steps !== undefined) existing.steps = dayObj.basics.steps;
        if (dayObj.basics.stepsNote) existing.stepsNote = dayObj.basics.stepsNote;
        if (dayObj.basics.sleepStart || dayObj.basics.sleepEnd || dayObj.basics.sleepHours) {
          existing.sleep = {
            sleepStart: dayObj.basics.sleepStart,
            sleepEnd: dayObj.basics.sleepEnd,
            sleepHours: dayObj.basics.sleepHours,
          };
        }
      } else {
        if (dayObj.steps !== undefined) existing.steps = dayObj.steps;
        if (dayObj.stepsNote) existing.stepsNote = dayObj.stepsNote;
        if (dayObj.sleep) existing.sleep = dayObj.sleep;
      }

      if (Array.isArray(dayObj.meals)) {
        existing.meals = dayObj.meals.map((m: any, idx: number) => ({
          id: m.id || `imp-m-${dateStr}-${idx}`,
          mealType: m.mealType || 'lunch',
          description: m.description || '',
          calories: m.calories || 0,
          protein: m.protein || 0,
          time: m.time || '12:00',
        }));
      }

      if (Array.isArray(dayObj.workouts)) {
        existing.workouts = dayObj.workouts.map((w: any, idx: number) => ({
          id: w.id || `imp-w-${dateStr}-${idx}`,
          name: w.name || 'Workout',
          type: w.type || 'calisthenics',
          durationMin: w.durationMin || 30,
          calories: w.calories || 150,
          time: w.time || '17:00',
          exercises: w.exercises || [],
        }));
      }

      if (Array.isArray(dayObj.walks)) {
        existing.walks = dayObj.walks;
      }

      if (dayObj.weight) {
        existing.weight = dayObj.weight;
      }

      // Recalculate or adopt points
      if (typeof dayObj.points === 'number') {
        existing.points = dayObj.points;
      } else {
        const breakdown = calculateDayPoints(existing, newProfile);
        existing.points = breakdown.total;
        existing.pointsBreakdown = breakdown;
      }

      newDays[dateStr] = existing;
    }
  }

  if (data.settings) {
    if (data.settings.weightKg) newProfile.weightKg = data.settings.weightKg;
    if (data.settings.calorieGoal) newProfile.calorieGoalGain = data.settings.calorieGoal;
    if (data.settings.proteinGoal) newProfile.proteinGoalMin = data.settings.proteinGoal;
    if (data.settings.proteinGoalMax) newProfile.proteinGoalMax = data.settings.proteinGoalMax;
    if (data.settings.stepsGoal) newProfile.stepsGoal = data.settings.stepsGoal;
    if (data.settings.bedtimeGoal) newProfile.bedtimeGoal = data.settings.bedtimeGoal;
  }

  if (data.profile) {
    Object.assign(newProfile, data.profile);
  }

  if (Array.isArray(data.weightHistory)) {
    for (const w of data.weightHistory) {
      if (!newWeightHistory.some(existing => existing.date === w.date)) {
        newWeightHistory.push(w);
      }
    }
    newWeightHistory.sort((a, b) => a.date.localeCompare(b.date));
  }

  return {
    ...currentState,
    days: newDays,
    profile: newProfile,
    weightHistory: newWeightHistory,
  };
}
