import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateLabel(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    const [y, m] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Calculate streak across consecutive days having points or logged activities
export function calculateStreak(days: Record<string, any>, referenceDate: string): number {
  let streak = 0;
  let curr = new Date(referenceDate);

  // Check today or past days backwards
  while (true) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;

    const day = days[key];
    const hasActivity = day && (
      (day.steps && day.steps > 0) ||
      (day.meals && day.meals.length > 0) ||
      (day.workouts && day.workouts.length > 0) ||
      (day.points && day.points > 0)
    );

    if (hasActivity) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
