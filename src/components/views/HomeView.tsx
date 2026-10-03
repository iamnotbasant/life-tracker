'use client';

import React, { useState } from 'react';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Zap,
  Moon,
  Scale,
  Coffee,
  Salad,
  Cookie,
  Soup,
  Plus,
} from 'lucide-react';
import { AppState, TabType, MealType, SleepData } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';
import { formatDateLabel, formatTime12h, calculateSleepHours, cn } from '../../lib/utils';
import { SleepModal } from '../SleepModal';
import { WeightModal } from '../WeightModal';
import { DateNavigator } from '../DateNavigator';

interface HomeViewProps {
  state: AppState;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog?: (tab?: 'steps' | 'meal' | 'workout' | 'weight' | 'sleep') => void;
  onOpenPointsInfo: () => void;
  streak: number;
  onDateChange?: (newDate: string) => void;
  onUpdateSleep?: (dateStr: string, sleep?: SleepData) => void;
  onLogWeight?: (weight: number, dateStr?: string) => void;
  onClearWeight?: (dateStr: string) => void;
  onOpenWeightPage?: () => void;
  onOpenSleepPage?: () => void;
}

const mealIcons: Record<MealType, React.ElementType> = {
  breakfast: Coffee,
  lunch: Salad,
  snack: Cookie,
  dinner: Soup,
};

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onSelectTab,
  onOpenQuickLog,
  onOpenPointsInfo,
  streak,
  onDateChange,
  onUpdateSleep,
  onLogWeight,
  onClearWeight,
  onOpenWeightPage,
  onOpenSleepPage,
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

  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

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
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);

  const netKcal = totalKcal - totalBurned;
  const targetKcal = profile.calorieGoalGain || 2500;
  const caloriePercent = Math.min(Math.round((totalKcal / targetKcal) * 100), 100);

  // Sleep info for active date
  const sleep = day.sleep;
  const hasSleep = Boolean(
    sleep && (sleep.sleepHours !== undefined || (sleep.sleepStart && sleep.sleepEnd))
  );
  const sleepHours =
    sleep?.sleepHours !== undefined
      ? sleep.sleepHours
      : (sleep?.sleepStart && sleep?.sleepEnd
        ? calculateSleepHours(sleep.sleepStart, sleep.sleepEnd)
        : null);
  const sleepRange =
    sleep?.sleepStart && sleep?.sleepEnd
      ? `${formatTime12h(sleep.sleepStart)} → ${formatTime12h(sleep.sleepEnd)}`
      : null;

  // All-time total points
  const totalAllTimePoints = Object.values(days).reduce((sum, d) => sum + (d.points || 0), 0);
  const totalPointsLabel = totalAllTimePoints < 0
    ? `−${Math.abs(totalAllTimePoints).toLocaleString()} total`
    : `${totalAllTimePoints.toLocaleString()} total`;

  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'B';

  const isToday = activeDate === '2026-10-03' || activeDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? `Today, ${formatDateLabel(activeDate)}` : formatDateLabel(activeDate);

  // 7-day strip calculation for steps card
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - (6 - i));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const dayData = days[dateKey];
    const daySteps = dayData?.steps || 0;
    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
    const isSelected = dateKey === activeDate;
    return { dateKey, daySteps, dayLetter, isSelected };
  });
  const maxSteps7d = Math.max(stepsGoal, ...last7Days.map(d => d.daySteps), 1);

  // 7-day points for glowing Points card sparkline
  const points7Days = Array.from({ length: 7 }, (_, i) => {
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - (6 - i));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const pts = days[dateKey]?.points || 0;
    return { dateKey, pts, isSelected: dateKey === activeDate };
  });
  const maxPts = Math.max(25, ...points7Days.map(p => Math.abs(p.pts)));

  // Weight card calculations
  const sortedWeightHistory = [...state.weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeightEntry = sortedWeightHistory.length > 0 ? sortedWeightHistory[sortedWeightHistory.length - 1] : null;
  const prevWeightEntry = sortedWeightHistory.length > 1 ? sortedWeightHistory[sortedWeightHistory.length - 2] : null;

  const currentWeightVal = latestWeightEntry?.weightKg ?? profile.weightKg;
  const displayWeight = currentWeightVal !== undefined ? `${currentWeightVal}` : '—';

  let weightCaption = 'No weight logged yet';
  if (latestWeightEntry && prevWeightEntry) {
    const diff = +(latestWeightEntry.weightKg - prevWeightEntry.weightKg).toFixed(1);
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
    const d1 = new Date(prevWeightEntry.date).getTime();
    const d2 = new Date(latestWeightEntry.date).getTime();
    const daysDiff = Math.abs(d2 - d1) / (1000 * 3600 * 24);
    if (daysDiff <= 7) {
      weightCaption = `${diffStr} kg this week`;
    } else {
      weightCaption = `${diffStr} kg vs previous`;
    }
  } else if (latestWeightEntry) {
    weightCaption = `last logged ${formatDateLabel(latestWeightEntry.date)}`;
  }

  const currentDayWeight = day.weight ?? state.weightHistory.find(w => w.date === activeDate)?.weightKg;

  // Grouped meals for inline meal rows
  const mealTypes: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'snack', label: 'Snack' },
    { type: 'dinner', label: 'Dinner' },
  ];
  const loggedMealTypes = mealTypes
    .map(g => {
      const typeMeals = meals.filter(m => m.mealType === g.type);
      const kcal = typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const foodItems = typeMeals.map(m => m.description).join(', ');
      return { ...g, meals: typeMeals, kcal, foodItems };
    })
    .filter(g => g.meals.length > 0);

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
      <DateNavigator currentDate={activeDate} onDateChange={onDateChange} />

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Points Card (Glowing Redesign)
          Dark card with emerald glow background, faint bars, dynamic "+22",
          "−14 total", flame in glowing emerald circle, "Guide →" pill,
          and subtle mini bar sparkline. Big number is WHITE.
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={onOpenPointsInfo}
        className="relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group border border-[#22C55E]/30 bg-[#0A0F0D]"
        style={{
          backgroundColor: '#0A0F0D',
          backgroundImage: "url('/points-card-bg.webp'), radial-gradient(ellipse at 15% 50%, rgba(34, 197, 94, 0.35) 0%, rgba(10, 15, 13, 0.95) 70%, #0A0F0D 100%)",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 0 24px rgba(34, 197, 94, 0.25)',
        }}
      >
        {/* CSS emerald radial-gradient fallback BEHIND image */}
        <div
          className="absolute inset-0 pointer-events-none -z-0 opacity-80"
          style={{
            background: 'radial-gradient(ellipse at 15% 50%, rgba(34, 197, 94, 0.35) 0%, rgba(10, 15, 13, 0.95) 60%, #0A0F0D 100%)',
          }}
        />

        <div className="relative z-10">
          {/* Top row: Label + Guide pill */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Today's Points</span>
            <span className="text-[11px] font-semibold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2.5 py-0.5 rounded-full group-hover:bg-[#22C55E]/25 group-hover:border-[#22C55E]/40 transition-all">
              Guide →
            </span>
          </div>

          {/* Middle/Main row: big number + caption on left, flame circle + sparkline on right */}
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(34,197,94,0.4)]">
                {day.points >= 0 ? `+${day.points}` : `−${Math.abs(day.points)}`}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-1">
                {totalPointsLabel}
              </div>
            </div>

            {/* Right side: Flame in glowing emerald circle + subtle mini bar sparkline */}
            <div className="flex flex-col items-end gap-2 pb-0.5">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.35)] group-hover:scale-105 transition-transform shrink-0">
                <Flame className="w-6 h-6 text-[#22C55E] fill-[#22C55E]/20" />
              </div>
              {/* Subtle mini bar sparkline */}
              <div className="flex items-end gap-1 h-5 pt-0.5 opacity-70">
                {points7Days.map((p) => {
                  const heightPercent = Math.min(Math.max(Math.round((Math.abs(p.pts) / maxPts) * 100), 20), 100);
                  return (
                    <div
                      key={p.dateKey}
                      className={cn(
                        "w-1.5 rounded-full transition-all duration-300",
                        p.isSelected
                          ? "bg-[#22C55E] shadow-[0_0_6px_#22C55E]"
                          : (p.pts > 0 ? "bg-[#22C55E]/60" : "bg-zinc-600/50")
                      )}
                      style={{ height: `${heightPercent}%` }}
                      title={`${p.dateKey}: ${p.pts} pts`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Sleep Card
          Compact card: small label "Sleep", big value "8h" (or "—"),
          caption with the range e.g. "11:30 PM → 7:30 AM" or empty hint.
          Moon Lucide icon. Tapping opens Sleep page (or SleepModal).
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => {
          if (onOpenSleepPage) {
            onOpenSleepPage();
          } else {
            setIsSleepModalOpen(true);
          }
        }}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Sleep</span>
          <Moon className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {hasSleep && sleepHours !== null ? `${sleepHours}h` : '—'}
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {hasSleep && sleepRange ? sleepRange : "Log last night's sleep"}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Calories Card
          "1,240 / 2,500 kcal" + green progress bar + NET row directly beneath
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('calories')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Calories</span>
          <Zap className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-3xl font-black text-white tracking-tight my-1.5">
          {totalKcal.toLocaleString()} <span className="text-zinc-500 text-lg font-normal">/ {targetKcal.toLocaleString()} kcal</span>
        </div>
        {/* Emerald green bar */}
        <div className="h-2 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02] my-2">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        {/* Inline NET row directly beneath */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Flame className="w-3.5 h-3.5 text-[#22C55E]/80 shrink-0" />
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-zinc-200">
                Net {netKcal >= 0 ? `+${netKcal.toLocaleString()}` : `−${Math.abs(netKcal).toLocaleString()}`} kcal
              </span>
              <span className="text-[11px] text-zinc-500">
                · {totalBurned.toLocaleString()} burned
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-400 shrink-0 ml-2">
            {caloriePercent}%
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 4: Steps Card
          Big number + goal bar ("7,450 / 10,000") + compact 7-day mini strip
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('steps')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Steps</span>
          <Footprints className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {steps.toLocaleString()}
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium mb-1">
          <span>{steps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
          <span>{stepsPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${stepsPercent}%` }}
          />
        </div>

        {/* Optional steps note */}
        {day.stepsNote && (
          <div className="text-[11px] text-zinc-400 mt-2 break-words">
            {day.stepsNote}
          </div>
        )}

        {/* Compact 7-day mini strip */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs mb-2 gap-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
              <span className="text-xs font-semibold text-zinc-300">Last 7 Days</span>
              <span className="text-[11px] text-zinc-500">· avg {Math.round(last7Days.reduce((s, d) => s + d.daySteps, 0) / 7).toLocaleString()}</span>
            </div>
            <span className="text-xs font-semibold text-zinc-400 shrink-0 ml-2">{stepsBurned} kcal</span>
          </div>
          <div className="flex items-end justify-between gap-1.5 bg-[#0e1411] p-2 rounded-xl border border-white/[0.04]">
            {last7Days.map((d) => (
              <div key={d.dateKey} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-8 bg-[#18201C] rounded flex items-end p-0.5 justify-center overflow-hidden">
                  <div
                    className={cn(
                      "w-full rounded-xs transition-all duration-300",
                      d.isSelected ? "bg-[#22C55E]" : "bg-zinc-700"
                    )}
                    style={{
                      height: `${Math.min(Math.max(Math.round((d.daySteps / maxSteps7d) * 100), 8), 100)}%`,
                    }}
                    title={`${d.dateKey}: ${d.daySteps.toLocaleString()} steps`}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px]",
                    d.isSelected ? "text-[#22C55E] font-bold" : "text-zinc-500"
                  )}
                >
                  {d.dayLetter}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 5: Meals Card
          Inline rows per meal type logged today (with meal-type icons) + footer row
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('meals')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Meals</span>
          <UtensilsCrossed className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {totalKcal.toLocaleString()} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalProtein}g protein • {meals.length} logged
        </div>

        {/* Inline Meal Rows */}
        <div className="pt-3 mt-3 border-t border-white/[0.06]">
          {meals.length === 0 ? (
            <div className="text-xs text-zinc-500 py-1 font-medium">No meals logged yet</div>
          ) : (
            <div>
              <div className="divide-y divide-white/[0.06]">
                {loggedMealTypes.map((g) => {
                  const MealIcon = mealIcons[g.type];
                  return (
                    <div key={g.type} className="py-3.5 first:pt-1">
                      {/* Top line: meal icon + small muted meal-type label in tiny caps + kcal bold right-aligned on SAME line */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {MealIcon && <MealIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            {g.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white shrink-0">
                          {g.kcal.toLocaleString()} kcal
                        </span>
                      </div>
                      {/* Full food description below in clean, readable body text */}
                      {g.foodItems && (
                        <p className="text-[13px] text-zinc-200 leading-relaxed mt-1.5 break-words">
                          {g.foodItems}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* TOTAL footer row with more top margin so it feels separated */}
              <div className="pt-3.5 mt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">TOTAL</span>
                <span className="text-white font-bold">{totalKcal.toLocaleString()} kcal · {totalProtein}g protein</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 6: Workout Card
          Inline list of today's workouts
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('workout')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Workouts</span>
          <Dumbbell className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {workoutBurned.toLocaleString()} <span className="text-lg font-normal text-zinc-500">kcal burned</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {workouts.length > 0 ? `${workouts.length} session${workouts.length > 1 ? 's' : ''} logged` : '0 min active'}
        </div>

        {/* Inline Workout List */}
        <div className="pt-3 mt-3 border-t border-white/[0.06]">
          {workouts.length === 0 ? (
            <div className="text-xs text-zinc-500 py-1 font-medium">No workouts logged yet</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {workouts.map((w) => {
                const exerciseNames = w.exercises?.map(e => e.name).filter(Boolean).join(', ');
                return (
                  <div key={w.id} className="py-3.5 first:pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          {w.name}
                        </span>
                        {w.time && (
                          <span className="text-[11px] text-zinc-500 shrink-0 font-normal">
                            · {w.time}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white shrink-0">
                        {w.durationMin}m · {w.calories} kcal
                      </span>
                    </div>
                    {exerciseNames && (
                      <p className="text-[13px] text-zinc-200 leading-relaxed mt-1.5 break-words">
                        {exerciseNames}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 7: Weight Card (NEW at the END of card order)
          Display-only card: big value = current weight from weightHistory (latest entry),
          small muted caption = change vs previous entry.
          Tapping opens Weight page (or WeightModal).
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => {
          if (onOpenWeightPage) {
            onOpenWeightPage();
          } else {
            setIsWeightModalOpen(true);
          }
        }}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Weight</span>
          <Scale className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {displayWeight} <span className="text-lg font-normal text-zinc-500">kg</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {weightCaption}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FLOATING ACTION BUTTON (FAB): Emerald "+" above bottom nav
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-20 right-4 sm:right-[calc(50%-13rem)] z-40">
        <button
          type="button"
          onClick={() => (onOpenQuickLog ? onOpenQuickLog('meal') : undefined)}
          className="w-14 h-14 rounded-full bg-[#22C55E] text-black shadow-[0_4px_24px_rgba(34,197,94,0.45)] hover:bg-[#16A34A] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-[#22C55E]/40"
          title="Quick Add"
          aria-label="Quick Add"
        >
          <Plus className="w-7 h-7 stroke-[2.8]" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Sleep Modal Bottom-Sheet
         ───────────────────────────────────────────────────────────── */}
      <SleepModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        sleepData={day.sleep}
        dateLabel={dateLabel}
        onSaveSleep={(newSleep) => {
          if (onUpdateSleep) {
            onUpdateSleep(activeDate, newSleep);
          }
        }}
        onClearSleep={() => {
          if (onUpdateSleep) {
            onUpdateSleep(activeDate, undefined);
          }
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          Weight Modal Bottom-Sheet
         ───────────────────────────────────────────────────────────── */}
      <WeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        currentWeight={currentDayWeight}
        dateLabel={dateLabel}
        onSaveWeight={(newWeight) => {
          if (onLogWeight) {
            onLogWeight(newWeight, activeDate);
          }
        }}
        onClearWeight={() => {
          if (onClearWeight) {
            onClearWeight(activeDate);
          }
        }}
      />
    </div>
  );
};
