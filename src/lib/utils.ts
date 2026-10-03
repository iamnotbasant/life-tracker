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
      (day.sleep && ((day.sleep.sleepHours && day.sleep.sleepHours > 0) || day.sleep.sleepStart)) ||
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

// Convert "HH:MM" (24h) to 12h format ("11:30 PM", "7:30 AM")
export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mFormatted = String(isNaN(m) ? 0 : m).padStart(2, '0');
  return `${h12}:${mFormatted} ${period}`;
}

// "18:21" + 5 min -> "6:21 PM → 6:26 PM"
export function timeRangeLabel(start?: string, durationMin?: number): string {
  if (!start) return '';
  const [hStr, mStr] = start.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h) || isNaN(m)) return formatTime12h(start);
  const totalMin = h * 60 + m + (durationMin || 0);
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return `${formatTime12h(start)} → ${formatTime12h(endStr)}`;
}

// Calculate sleep duration in hours from two "HH:MM" 24h times, handling overnight wrap
export function calculateSleepHours(sleepStart: string, sleepEnd: string): number {
  if (!sleepStart || !sleepEnd) return 0;
  const [h1, m1] = sleepStart.split(':').map(Number);
  const [h2, m2] = sleepEnd.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;

  const startMin = h1 * 60 + m1;
  const endMin = h2 * 60 + m2;

  if (startMin === endMin) {
    return 0;
  }

  let diffMin = endMin - startMin;
  if (diffMin < 0) {
    // Overnight wrap, e.g. 23:30 (1410 min) to 07:30 (450 min) -> 480 min
    diffMin += 24 * 60;
  }

  return Math.round((diffMin / 60) * 10) / 10;
}
