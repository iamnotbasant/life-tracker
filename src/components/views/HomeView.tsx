'use client';

import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Utensils,
  Zap,
} from 'lucide-react';
import { AppState, TabType, MealType } from '../../lib/types';
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

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onSelectTab,
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
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);

  const netKcal = totalKcal - totalBurned;
  const targetKcal = profile.calorieGoalGain || 2500;
  const caloriePercent = Math.min(Math.round((totalKcal / targetKcal) * 100), 100);

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
          CARD 1: Points Card
          Big green number + small caption (total points).
          Tapping it -> scoring-guide modal
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={onOpenPointsInfo}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Today's Points</span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#22C55E]/70 group-hover:text-[#22C55E] transition-colors" />
            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">Guide →</span>
          </div>
        </div>
        <div className="text-5xl font-black text-[#22C55E] tracking-tight my-1">
          {day.points >= 0 ? `+${day.points}` : day.points}
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalAllTimePoints.toLocaleString()} total
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Calories Card
          "1,240 / 2,500 kcal" + green progress bar + NET row directly beneath
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('calories')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Calories</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">Details →</span>
          </div>
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
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Flame className="w-3.5 h-3.5 text-[#22C55E]/80 shrink-0" />
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-xs font-semibold text-zinc-200 shrink-0">
                Net {netKcal >= 0 ? `+${netKcal.toLocaleString()}` : `−${Math.abs(netKcal).toLocaleString()}`} kcal
              </span>
              <span className="text-[11px] text-zinc-500 truncate">
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
          CARD 3: Steps Card
          Big number + goal bar ("7,450 / 10,000") + compact 7-day mini strip
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('steps')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Steps</span>
          <div className="flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">Details →</span>
          </div>
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

        {/* Compact 7-day mini strip */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="text-xs font-semibold text-zinc-300">Last 7 Days</span>
              <span className="text-[11px] text-zinc-500">· avg {Math.round(last7Days.reduce((s, d) => s + d.daySteps, 0) / 7).toLocaleString()}</span>
            </div>
            <span className="text-xs font-semibold text-zinc-400">{stepsBurned} kcal</span>
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
          CARD 4: Meals Card
          Inline rows per meal type logged today + footer row
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('meals')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Meals</span>
          <div className="flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">Details →</span>
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {totalKcal.toLocaleString()} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalProtein}g protein • {meals.length} logged
        </div>

        {/* Inline Meal Rows */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06]">
          {meals.length === 0 ? (
            <div className="text-xs text-zinc-500 py-1 font-medium">No meals logged yet</div>
          ) : (
            <div className="space-y-1">
              <div className="divide-y divide-white/[0.04]">
                {loggedMealTypes.map((g) => (
                  <div key={g.type} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Utensils className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="font-semibold text-zinc-200 shrink-0">{g.label}</span>
                      <span className="text-zinc-500 truncate">{g.foodItems}</span>
                    </div>
                    <span className="font-semibold text-white shrink-0 text-right ml-1">
                      {g.kcal.toLocaleString()} kcal
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer row */}
              <div className="pt-2 mt-1 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400">TOTAL</span>
                <span className="text-zinc-200 font-bold">{totalKcal.toLocaleString()} kcal · {totalProtein}g protein</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 5: Workout Card
          Inline list of today's workouts
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('workout')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Workouts</span>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">Details →</span>
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {workoutBurned.toLocaleString()} <span className="text-lg font-normal text-zinc-500">kcal burned</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {workouts.length > 0 ? `${workouts.length} session${workouts.length > 1 ? 's' : ''} logged` : '0 min active'}
        </div>

        {/* Inline Workout List */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06]">
          {workouts.length === 0 ? (
            <div className="text-xs text-zinc-500 py-1 font-medium">No workouts logged yet</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {workouts.map((w) => {
                const exerciseNames = w.exercises?.map(e => e.name).filter(Boolean).join(', ');
                return (
                  <div key={w.id} className="py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Dumbbell className="w-3.5 h-3.5 text-[#22C55E]/70 shrink-0" />
                        <span className="font-semibold text-zinc-200 truncate">{w.name}</span>
                        {w.time && (
                          <span className="text-[11px] text-zinc-500 shrink-0">{w.time}</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-zinc-300 shrink-0 text-right ml-1">
                        {w.durationMin}m · {w.calories} kcal
                      </span>
                    </div>
                    {exerciseNames && (
                      <div className="pl-5.5 text-[11px] text-zinc-500 truncate mt-0.5">
                        {exerciseNames}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
