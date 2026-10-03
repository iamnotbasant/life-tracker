import { DayData, PointsBreakdown, UserProfile } from './types';

export function calculateDayPoints(day: DayData, profile: UserProfile, streak: number = 0): PointsBreakdown {
  const notes: string[] = [];

  // 1. Calories points
  const totalKcal = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  let caloriesPts = 0;
  if (totalKcal === 0) {
    caloriesPts = 0;
    notes.push('Calories: Not logged (0 pts)');
  } else if (totalKcal >= 2400 && totalKcal <= 2650) {
    caloriesPts = 10;
    notes.push(`Calories: ${totalKcal} kcal (+10 pts, perfect gain zone)`);
  } else if (totalKcal >= 2200 && totalKcal < 2400) {
    caloriesPts = 5;
    notes.push(`Calories: ${totalKcal} kcal (+5 pts, maintain zone)`);
  } else if (totalKcal >= 2000 && totalKcal < 2200) {
    caloriesPts = 0;
    notes.push(`Calories: ${totalKcal} kcal (0 pts, near maintain)`);
  } else if (totalKcal >= 1 && totalKcal < 2000) {
    caloriesPts = -8;
    notes.push(`Calories: ${totalKcal} kcal (-8 pts, under-eating)`);
  } else {
    // 2900+ or 2651-2899
    if (totalKcal >= 2900) {
      caloriesPts = -5;
      notes.push(`Calories: ${totalKcal} kcal (-5 pts, excessive surplus)`);
    } else {
      caloriesPts = 5;
      notes.push(`Calories: ${totalKcal} kcal (+5 pts, upper gain surplus)`);
    }
  }

  // 2. Protein points
  const totalProtein = day.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  let proteinPts = 0;
  if (totalProtein === 0) {
    proteinPts = 0;
    notes.push('Protein: Not logged (0 pts)');
  } else if (totalProtein >= 85) {
    proteinPts = 10;
    notes.push(`Protein: ${totalProtein}g (+10 pts, goal hit!)`);
  } else if (totalProtein >= 65) {
    proteinPts = 5;
    notes.push(`Protein: ${totalProtein}g (+5 pts, close to goal)`);
  } else {
    proteinPts = -5;
    notes.push(`Protein: ${totalProtein}g (-5 pts, under minimum)`);
  }

  // 3. Steps points
  const steps = day.steps || 0;
  let stepsPts = 0;
  if (steps === 0) {
    stepsPts = 0;
    notes.push('Steps: Not logged (0 pts)');
  } else if (steps >= 10000) {
    stepsPts = 10;
    notes.push(`Steps: ${steps.toLocaleString()} (+10 pts, 10k target hit)`);
  } else if (steps >= 7500) {
    stepsPts = 5;
    notes.push(`Steps: ${steps.toLocaleString()} (+5 pts, active day)`);
  } else if (steps >= 5000) {
    stepsPts = 2;
    notes.push(`Steps: ${steps.toLocaleString()} (+2 pts, moderate movement)`);
  } else {
    stepsPts = -5;
    notes.push(`Steps: ${steps.toLocaleString()} (-5 pts, low movement)`);
  }

  // 4. Workout points
  const totalWorkoutMin = (day.workouts || []).reduce((sum, w) => sum + (w.durationMin || 0), 0);
  let workoutPts = 0;
  if (totalWorkoutMin >= 15 || (day.workouts && day.workouts.length > 0)) {
    workoutPts = 10;
    notes.push(`Workout: Logged (${totalWorkoutMin}m) (+10 pts)`);
  } else {
    workoutPts = 0;
    notes.push('Workout: None logged (0 pts)');
  }

  // 5. Sleep points (if recorded)
  let sleepPts = 0;
  if (day.sleep && (day.sleep.sleepHours !== undefined || day.sleep.sleepStart)) {
    const hours = day.sleep.sleepHours ?? 0;
    let durationPts = 0;
    if (hours >= 7 && hours <= 8.5) {
      durationPts = 10;
    } else if ((hours >= 6 && hours < 7) || (hours > 8.5 && hours <= 9.5)) {
      durationPts = 5;
    } else if (hours > 0) {
      durationPts = -5;
    }

    let bedtimePts = 0;
    if (day.sleep.sleepStart) {
      const [h, m] = day.sleep.sleepStart.split(':').map(Number);
      // Asleep before or at 23:30 (e.g. 21:00 - 23:30)
      if (h >= 20 && (h < 23 || (h === 23 && m <= 30))) {
        bedtimePts = 5;
      } else if (h >= 0 && (h > 0 || m > 30) && h < 6) {
        bedtimePts = -5; // After 00:30
      }
    }

    sleepPts = durationPts + bedtimePts;
    notes.push(`Sleep: ${hours}h (+${sleepPts} pts)`);
  }

  // 6. Weight logged
  let weightPts = 0;
  if (day.weight && day.weight > 0) {
    weightPts = 5;
    notes.push(`Weight: ${day.weight} kg logged (+5 pts)`);
  }

  // 7. Streak bonus
  let streakPts = 0;
  if (streak >= 3) {
    streakPts = 5;
    notes.push(`Streak: ${streak} days (+5 pts bonus)`);
  }

  const total = caloriesPts + proteinPts + stepsPts + workoutPts + sleepPts + weightPts + streakPts;

  return {
    caloriesPts,
    proteinPts,
    stepsPts,
    workoutPts,
    sleepPts,
    weightPts,
    streakPts,
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
