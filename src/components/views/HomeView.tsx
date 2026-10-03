'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowIcon, Flame, Footprints, Dumbbell, UtensilsCrossed, MapPin, Zap } from 'lucide-react';
import { AppState, TabType } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';
import { formatDateLabel } from '../../lib/utils';

interface HomeViewProps {
  state: AppState;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog?: (tab?: 'steps' | 'meal' | 'walk' | 'workout' | 'weight') => void;
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

  // Calculations for current active date
  const steps = day.steps || 0;
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

  const walks = day.walks || [];
  const totalWalkKm = walks.reduce((sum, w) => sum + (w.distanceKm || 0), 0);
  const totalWalkSteps = walks.reduce((sum, w) => sum + (w.steps || 0), 0);
  const totalWalkMin = walks.reduce((sum, w) => sum + (w.durationMin || 0), 0);

  // All-time total points
  const totalAllTimePoints = Object.values(days).reduce((sum, d) => sum + (d.points || 0), 0);

  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'B';

  const handlePrevDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const isToday = activeDate === '2026-10-03' || activeDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          HEADER: "Life Tracker" + Avatar initial circle
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Life Tracker</h1>
          {/* Subtle Date Switcher */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400">
            {onDateChange && (
              <button
                onClick={handlePrevDay}
                className="p-1 hover:text-white transition-colors rounded"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="font-medium text-zinc-300">
              {isToday ? 'Today, ' : ''}{formatDateLabel(activeDate)}
            </span>
            {onDateChange && (
              <button
                onClick={handleNextDay}
                className="p-1 hover:text-white transition-colors rounded"
                aria-label="Next day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-zinc-600">•</span>
            <button
              onClick={onOpenPointsInfo}
              className="text-[11px] text-[#22C55E] hover:underline flex items-center gap-0.5"
            >
              <span>{streak}d streak</span>
            </button>
          </div>
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
          CARD 1: "Today's Points" (big green number + "X total" caption)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={onOpenPointsInfo}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Today's Points</span>
          <Flame className="w-4 h-4 text-[#22C55E]/60 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-5xl font-black text-[#22C55E] tracking-tight my-1">
          {day.points >= 0 ? `+${day.points}` : day.points}
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalAllTimePoints} total
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: "Calories" ("1,240 / 2,500 kcal" + green bar)
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
        <div className="h-2 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mt-2 flex items-center justify-between">
          <span>Net {netKcal >= 0 ? `+${netKcal}` : netKcal} kcal</span>
          <span>{caloriePercent}% of goal</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Steps (big number, "goal 10,000" caption)
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
        <div className="text-[11px] text-zinc-500 font-medium">
          goal {profile.stepsGoal.toLocaleString()}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 4: Walk (km)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('walk')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Walk</span>
          <MapPin className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {totalWalkKm.toFixed(1)} <span className="text-lg font-normal text-zinc-500">km</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalWalkSteps > 0 ? `${totalWalkSteps.toLocaleString()} steps • ${totalWalkMin} min` : 'No walks logged'}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 5: Workout (kcal burned)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectTab('workout')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Workout</span>
          <Dumbbell className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {workoutBurned} <span className="text-lg font-normal text-zinc-500">kcal burned</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {workouts.length > 0 ? `${workouts.length} session${workouts.length > 1 ? 's' : ''} logged` : '0 min active'}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 6: Meals (kcal + protein)
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
          {totalKcal} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalProtein}g protein • {meals.length} logged
        </div>
      </div>
    </div>
  );
};
