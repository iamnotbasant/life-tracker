import { DayData, PointsBreakdown, UserProfile } from './types';

// Daily points system: 0-10 scale (no negatives).
//   Calories  0-3  (3 = gain zone 2400-2700, 2 = close, 1 = logged but low)
//   Protein   0-2  (2 = >=85g goal, 1 = 60-84g)
//   Steps     0-2  (2 = >=10k, 1 = 5k-9,999)
//   Workout   0-1  (1 = logged)
//   Sleep     0-1  (1 = 7-9h)
//   Weight    0-1  (1 = logged)
// Max total = 10.
export function calculateDayPoints(day: DayData, profile: UserProfile, streak: number = 0): PointsBreakdown {
  const notes: string[] = [];

  // 1. Calories (max 3)
  const totalKcal = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  let caloriesPts = 0;
  if (totalKcal >= 2400 && totalKcal <= 2700) {
    caloriesPts = 3;
    notes.push(`Calories: ${totalKcal} kcal (+3 pts, gain zone)`);
  } else if (
    (totalKcal >= 2200 && totalKcal < 2400) ||
    (totalKcal > 2700 && totalKcal <= 2900)
  ) {
    caloriesPts = 2;
    notes.push(`Calories: ${totalKcal} kcal (+2 pts, close to zone)`);
  } else if (totalKcal >= 1) {
    caloriesPts = 1;
    notes.push(`Calories: ${totalKcal} kcal (+1 pt, logged)`);
  } else {
    notes.push('Calories: Not logged (0 pts)');
  }

  // 2. Protein (max 2)
  const totalProtein = day.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  let proteinPts = 0;
  if (totalProtein >= 85) {
    proteinPts = 2;
    notes.push(`Protein: ${totalProtein}g (+2 pts, goal hit!)`);
  } else if (totalProtein >= 60) {
    proteinPts = 1;
    notes.push(`Protein: ${totalProtein}g (+1 pt, on the way)`);
  } else if (totalProtein > 0) {
    notes.push(`Protein: ${totalProtein}g (0 pts, under 60g)`);
  } else {
    notes.push('Protein: Not logged (0 pts)');
  }

  // 3. Steps (max 2)
  const steps = day.steps || 0;
  let stepsPts = 0;
  if (steps >= 10000) {
    stepsPts = 2;
    notes.push(`Steps: ${steps.toLocaleString()} (+2 pts, 10k hit)`);
  } else if (steps >= 5000) {
    stepsPts = 1;
    notes.push(`Steps: ${steps.toLocaleString()} (+1 pt, active)`);
  } else if (steps > 0) {
    notes.push(`Steps: ${steps.toLocaleString()} (0 pts, low)`);
  } else {
    notes.push('Steps: Not logged (0 pts)');
  }

  // 4. Workout (max 1)
  const workoutCount = (day.workouts || []).length;
  const workoutPts = workoutCount > 0 ? 1 : 0;
  notes.push(
    workoutCount > 0 ? `Workout: Logged (+1 pt)` : 'Workout: None logged (0 pts)'
  );

  // 5. Sleep (max 1)
  let sleepPts = 0;
  if (day.sleep && day.sleep.sleepHours !== undefined && day.sleep.sleepHours >= 7 && day.sleep.sleepHours <= 9) {
    sleepPts = 1;
    notes.push(`Sleep: ${day.sleep.sleepHours}h (+1 pt)`);
  } else if (day.sleep && (day.sleep.sleepHours !== undefined || day.sleep.sleepStart)) {
    notes.push(`Sleep: ${day.sleep.sleepHours ?? '?'}h (0 pts, aim 7-9h)`);
  } else {
    notes.push('Sleep: Not logged (0 pts)');
  }

  // 6. Weight (max 1)
  const weightPts = day.weight && day.weight > 0 ? 1 : 0;
  if (weightPts) {
    notes.push(`Weight: ${day.weight} kg logged (+1 pt)`);
  } else {
    notes.push('Weight: Not logged (0 pts)');
  }

  const total = caloriesPts + proteinPts + stepsPts + workoutPts + sleepPts + weightPts;

  return {
    caloriesPts,
    proteinPts,
    stepsPts,
    workoutPts,
    sleepPts,
    weightPts,
    total,
    notes,
  };
}

// Mifflin-St Jeor BMR calculator
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' = 'male'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}

// Steps calories burned estimate
export function estimateStepsCalories(steps: number, factor: number = 0.043): number {
  return Math.round(steps * factor);
}
