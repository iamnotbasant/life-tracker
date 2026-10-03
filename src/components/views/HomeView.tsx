'use client';

import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Zap,
  Plus,
  Moon,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Footprints,
} from 'lucide-react';
import { AppState, TabType } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';
import { formatDateLabel, cn } from '../../lib/utils';

interface HomeViewProps {
  state: AppState;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog?: (tab?: 'steps' | 'meal' | 'workout' | 'weight') => void;
  onOpenPointsInfo: () => void;
  streak: number;
  onDateChange?: (newDate: string) => void;
}

interface TimelineNode {
  id: string;
  timeLabel: string;
  sortMinutes: number;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  details?: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

function formatTimeString(timeStr?: string): string {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

function parseMinutes(timeStr?: string, defaultMinutes = 0): number {
  if (!timeStr) return defaultMinutes;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return defaultMinutes;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onSelectTab,
  onOpenQuickLog,
  onOpenPointsInfo,
  streak,
  onDateChange,
}) => {
  const { profile, activeDate, days } = state;
  const day = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Calculations for current active date
  const steps = day.steps || 0;
  const stepsGoal = profile.stepsGoal || 10000;
  const stepsPercent = Math.min(Math.round((steps / stepsGoal) * 100), 100);
  const stepsBurned = estimateStepsCalories(steps, profile.stepCalorieFactor);

  const workouts = day.workouts || [];
  const workoutBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const totalBurned = bmr + stepsBurned + workoutBurned;

  const meals = day.meals || [];
  const totalKcal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const targetKcal = profile.calorieGoalGain || 2500;
  const caloriePercent = Math.min(Math.round((totalKcal / targetKcal) * 100), 100);
  const netKcal = totalKcal - totalBurned;

  // All-time total points
  const totalAllTimePoints = Object.values(days).reduce((sum, d) => sum + (d.points || 0), 0);

  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'B';

  const handlePrevDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleOpenDatePicker = () => {
    if (!dateInputRef.current) return;
    try {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
        return;
      }
    } catch {}
    dateInputRef.current.focus();
  };

  const isToday = activeDate === '2026-10-03' || activeDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? `Today, ${formatDateLabel(activeDate)}` : formatDateLabel(activeDate);

  // ─────────────────────────────────────────────────────────────
  // Build time-ordered timeline nodes from the SELECTED day's data
  // ─────────────────────────────────────────────────────────────
  const nodes: TimelineNode[] = [];

  // 1. Sleep/wake node (Lucide Moon icon): "Woke 7:30 AM · 8h"
  let sleepSortMinutes = 450; // default 7:30 AM
  if (day.sleep && (day.sleep.sleepHours !== undefined || day.sleep.sleepEnd)) {
    const wakeStr = day.sleep.sleepEnd || '07:30';
    const wakeFormatted = formatTimeString(wakeStr);
    sleepSortMinutes = parseMinutes(wakeStr, 450);
    const sleepDuration = day.sleep.sleepHours ? `${day.sleep.sleepHours}h` : '';
    const sleepLabel = `Woke ${wakeFormatted}${sleepDuration ? ` · ${sleepDuration}` : ''}`;
    const bedtimeSub = day.sleep.sleepStart
      ? `Asleep at ${formatTimeString(day.sleep.sleepStart)}`
      : undefined;

    nodes.push({
      id: 'node-sleep',
      timeLabel: wakeFormatted,
      sortMinutes: sleepSortMinutes,
      icon: Moon,
      title: 'Sleep & Wake',
      subtitle: sleepLabel,
      details: bedtimeSub ? (
        <p className="text-[11px] text-zinc-500 mt-0.5">{bedtimeSub}</p>
      ) : undefined,
      badge: day.pointsBreakdown?.sleepPts
        ? `${day.pointsBreakdown.sleepPts > 0 ? '+' : ''}${day.pointsBreakdown.sleepPts} pts`
        : undefined,
      onClick: onOpenPointsInfo,
    });
  }

  // 2. Steps node (Lucide Footprints icon): "7,450 steps · 320 kcal"
  // Place as the FIRST node after sleep (or as summary node at top of timeline)
  if (steps > 0) {
    const stepsSortMinutes = nodes.length > 0 ? sleepSortMinutes + 0.1 : 450.1;
    nodes.push({
      id: 'node-steps',
      timeLabel: 'All Day',
      sortMinutes: stepsSortMinutes,
      icon: Footprints,
      title: 'Steps',
      subtitle: `${steps.toLocaleString()} steps · ${stepsBurned} kcal`,
      details: (
        <div className="mt-1.5 space-y-1">
          <div className="h-1.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 font-medium flex items-center justify-between">
            <span>goal {stepsGoal.toLocaleString()}</span>
            <span>{stepsPercent}%</span>
          </div>
        </div>
      ),
      badge: day.pointsBreakdown?.stepsPts
        ? `${day.pointsBreakdown.stepsPts > 0 ? '+' : ''}${day.pointsBreakdown.stepsPts} pts`
        : undefined,
      onClick: () => onSelectTab('steps'),
    });
  }

  // 3. Weight node (Lucide Scale icon) if logged that day: "48.9 kg"
  const dayWeight = day.weight ?? state.weightHistory.find((w) => w.date === activeDate)?.weightKg;
  const weightNote = state.weightHistory.find((w) => w.date === activeDate)?.note;
  if (dayWeight !== undefined && dayWeight > 0) {
    const weightSortMinutes = nodes.length > 0 ? sleepSortMinutes + 0.2 : 450.2;
    nodes.push({
      id: 'node-weight',
      timeLabel: 'Morning',
      sortMinutes: weightSortMinutes,
      icon: Scale,
      title: 'Weight',
      subtitle: `${dayWeight} kg${weightNote ? ` · ${weightNote}` : ''}`,
      badge: day.pointsBreakdown?.weightPts
        ? `+${day.pointsBreakdown.weightPts} pts`
        : undefined,
      onClick: () => onSelectTab('weight'),
    });
  }

  // 4. Meal nodes in time order (Lucide UtensilsCrossed icon): "Breakfast · 8:45 AM" + items description + kcal (+ protein small)
  meals.forEach((m, idx) => {
    const formattedMealTime = formatTimeString(m.time);
    const mealTypeName = m.mealType.charAt(0).toUpperCase() + m.mealType.slice(1);
    nodes.push({
      id: m.id || `node-meal-${idx}`,
      timeLabel: formattedMealTime || 'Meal',
      sortMinutes: parseMinutes(m.time, 720 + idx),
      icon: UtensilsCrossed,
      title: `${mealTypeName} · ${formattedMealTime}`,
      subtitle: m.description,
      details: (
        <div className="text-[11px] text-zinc-400 mt-1 font-medium flex items-center gap-1.5">
          <span className="text-[#22C55E] font-semibold">{m.calories} kcal</span>
          <span className="text-zinc-600">·</span>
          <span>{m.protein}g protein</span>
        </div>
      ),
      onClick: () => onSelectTab('meals'),
    });
  });

  // 5. Workout nodes (Lucide Dumbbell icon): "Calisthenics Push · 6:00 PM" + duration + kcal + exercise names (small text)
  workouts.forEach((w, idx) => {
    const formattedWoTime = formatTimeString(w.time || '18:00');
    const exerciseNames = w.exercises?.map((e) => e.name).filter(Boolean).join(', ') || w.notes;
    nodes.push({
      id: w.id || `node-workout-${idx}`,
      timeLabel: formattedWoTime,
      sortMinutes: parseMinutes(w.time, 18 * 60 + idx),
      icon: Dumbbell,
      title: `${w.name} · ${formattedWoTime}`,
      subtitle: `${w.durationMin} min · ${w.calories} kcal`,
      details: exerciseNames ? (
        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
          {exerciseNames}
        </p>
      ) : undefined,
      badge: '+10 pts',
      onClick: () => onSelectTab('workout'),
    });
  });

  // Sort nodes chronologically by time
  nodes.sort((a, b) => a.sortMinutes - b.sortMinutes);

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          HEADER: "Life Tracker" + Streak badge + Avatar initial circle
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Life Tracker</h1>
          <button
            onClick={onOpenPointsInfo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#22C55E] hover:underline mt-0.5"
            aria-label="View points & streak rules"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{streak}d streak</span>
          </button>
        </div>

        {/* Avatar initial circle */}
        <button
          onClick={() => onSelectTab('settings')}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-white font-bold text-sm flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="Profile & Settings"
          aria-label="Profile & Settings"
        >
          {initial}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PROMINENT DATE NAVIGATOR: [< 48px] [ Date Pill + Picker ] [> 48px]
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-1 pb-1">
        <button
          type="button"
          onClick={handlePrevDay}
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 hover:text-white text-zinc-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <button
            type="button"
            onClick={handleOpenDatePicker}
            className="w-full h-12 min-h-[48px] px-4 rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm text-center group"
            aria-label="Select date"
          >
            <Calendar className="w-4 h-4 text-[#22C55E]/80 group-hover:text-[#22C55E] transition-colors shrink-0" />
            <span className="text-sm font-semibold text-white tracking-wide truncate">
              {dateLabel}
            </span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={activeDate}
            onChange={(e) => {
              if (e.target.value && onDateChange) {
                onDateChange(e.target.value);
              }
            }}
            className="sr-only"
            tabIndex={-1}
            aria-label="Select date"
          />
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 hover:text-white text-zinc-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMPACT POINTS STRIP (slim single line: "17 pts today · 240 total")
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={onOpenPointsInfo}
        className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121815] border border-white/[0.05] hover:border-white/10 cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 text-xs">
          <Flame className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
          <span className="font-semibold text-white">
            {day.points > 0 ? `+${day.points}` : day.points} pts today
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 font-medium">
            {totalAllTimePoints} total
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#22C55E] hover:underline">
          Rules →
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SLIM CALORIES BAR (consumed/target with green progress bar)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('calories')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-3.5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Calories</span>
          </div>
          <span className="text-zinc-400 font-medium text-xs">
            {totalKcal.toLocaleString()} / {targetKcal.toLocaleString()} kcal
          </span>
        </div>
        <div className="h-2 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <div className="text-[10px] text-zinc-500 font-medium mt-1.5 flex items-center justify-between">
          <span>Net {netKcal >= 0 ? `+${netKcal.toLocaleString()}` : netKcal.toLocaleString()} kcal</span>
          <span>{caloriePercent}% of goal</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          "TODAY" VERTICAL DAY TIMELINE
         ───────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-2 px-1">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {isToday ? "Today's Timeline" : 'Day Timeline'}
          </h2>
          <button
            type="button"
            onClick={() => onOpenQuickLog?.('steps')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18201C] hover:bg-[#22C55E]/15 hover:text-[#22C55E] text-zinc-400 border border-white/[0.06] text-xs font-semibold transition-all active:scale-95"
            title="Quick log"
            aria-label="Quick log"
          >
            <Plus className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Add</span>
          </button>
        </div>

        {nodes.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl bg-[#121815]/60 border border-white/[0.04] text-center">
            <p className="text-sm text-zinc-400 font-medium">Nothing logged yet — tap + to add</p>
            <button
              type="button"
              onClick={() => onOpenQuickLog?.('steps')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Activity</span>
            </button>
          </div>
        ) : (
          <div className="relative pt-1">
            {nodes.map((node, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === nodes.length - 1;
              const Icon = node.icon;

              return (
                <div key={node.id} className="relative flex items-start gap-2.5">
                  {/* Time label on the LEFT */}
                  <div className="w-14 shrink-0 text-right pt-3">
                    <span className="text-[11px] font-bold text-zinc-400 tracking-tight block leading-tight">
                      {node.timeLabel}
                    </span>
                  </div>

                  {/* Vertical line + Green dot ON the line */}
                  <div className="relative flex flex-col items-center self-stretch shrink-0 w-5">
                    {/* Top connecting line segment */}
                    <div
                      className={cn(
                        'w-[2px] grow bg-white/[0.08]',
                        isFirst ? 'invisible' : ''
                      )}
                    />
                    {/* Green dot */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-4 ring-[#0A0F0D] shrink-0 my-1 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    {/* Bottom connecting line segment */}
                    <div
                      className={cn(
                        'w-[2px] grow bg-white/[0.08]',
                        isLast ? 'invisible' : ''
                      )}
                    />
                  </div>

                  {/* Compact card on the RIGHT with details (no tap-to-expand) */}
                  <div className="flex-1 pb-3 pt-0.5 min-w-0">
                    <div
                      onClick={node.onClick}
                      className={cn(
                        'bg-[#121815] border border-white/[0.05] rounded-2xl p-3.5 transition-all shadow-sm',
                        node.onClick &&
                          'hover:border-[#22C55E]/30 cursor-pointer active:scale-[0.99]'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center shrink-0 text-[#22C55E]">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-white text-xs truncate">
                            {node.title}
                          </span>
                        </div>
                        {node.badge && (
                          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded shrink-0">
                            {node.badge}
                          </span>
                        )}
                      </div>

                      {node.subtitle && (
                        <p className="text-xs text-zinc-300 mt-1.5 leading-snug">
                          {node.subtitle}
                        </p>
                      )}

                      {node.details}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
