import { AppState, DayData, UserProfile, WeightEntry } from './types';
import { getInitialSeedData } from './seed-data';
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
    const hadFakeWeight = date === '2026-10-01' && day.weight !== undefined;

    if (
      meals.length !== (day.meals || []).length ||
      walks.length !== (day.walks || []).length ||
      workouts.length !== (day.workouts || []).length ||
      hadFakeWeight
    ) {
      const cleaned: DayData = { ...day, meals, walks, workouts };
      if (hadFakeWeight) {
        delete cleaned.weight;
      }
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

  let weightHistory = state.weightHistory.filter((w) => !FAKE_WEIGHT_NOTES.has(w.note || ''));
  if (weightHistory.length !== state.weightHistory.length) changed = true;
  if (!weightHistory.some((w) => w.date === '2026-10-02')) {
    weightHistory = [
      ...weightHistory,
      { id: 'w-1', date: '2026-10-02', weightKg: 48.9, note: 'Measured' },
    ];
    weightHistory.sort((a, b) => a.date.localeCompare(b.date));
    changed = true;
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
