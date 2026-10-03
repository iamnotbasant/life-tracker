'use client';

import React from 'react';
import { AppState } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';
import { formatDateLabel } from '../../lib/utils';
import { DateNavigator } from '../DateNavigator';

interface CaloriesViewProps {
  state: AppState;
  onSelectTab?: (tab: any) => void;
  onDateChange?: (newDate: string) => void;
}

export const CaloriesView: React.FC<CaloriesViewProps> = ({ state, onSelectTab, onDateChange }) => {
  const { profile, activeDate, days } = state;
  const currentDay = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  // Card 1: Consumed
  const meals = currentDay.meals || [];
  const consumedTotal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  const mealBreakdown = {
    breakfast: meals.filter(m => m.mealType === 'breakfast').reduce((s, m) => s + m.calories, 0),
    lunch: meals.filter(m => m.mealType === 'lunch').reduce((s, m) => s + m.calories, 0),
    snack: meals.filter(m => m.mealType === 'snack').reduce((s, m) => s + m.calories, 0),
    dinner: meals.filter(m => m.mealType === 'dinner').reduce((s, m) => s + m.calories, 0),
  };

  // Card 2: Burned Split (BMR + Steps + Workouts)
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const stepsBurned = estimateStepsCalories(currentDay.steps || 0, profile.stepCalorieFactor);
  const workoutBurned = (currentDay.workouts || []).reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalBurned = bmr + stepsBurned + workoutBurned;

  // Card 3 & 4: Net vs Target
  const netCalories = consumedTotal - totalBurned;
  const isSurplus = netCalories >= 0;
  const targetGain = profile.calorieGoalGain || 2500;
  const targetPercent = Math.min(Math.round((consumedTotal / targetGain) * 100), 100);

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2">
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('home')}
              className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <span className="text-xl">←</span>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Calories</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Energy balance & expenditure</p>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      <DateNavigator currentDate={activeDate} onDateChange={onDateChange} />

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Consumed
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Consumed</span>
          <span className="text-[11px] text-zinc-500">{meals.length} meal{meals.length === 1 ? '' : 's'}</span>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-2">
          {consumedTotal} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mb-3">
          Energy from food intake
        </div>

        {/* 4 Meal Breakdown Rows */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.04]">
          <div className="bg-[#18201C] p-2 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">B-fast</div>
            <div className="text-xs font-bold text-white mt-0.5">{mealBreakdown.breakfast}</div>
          </div>
          <div className="bg-[#18201C] p-2 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">Lunch</div>
            <div className="text-xs font-bold text-white mt-0.5">{mealBreakdown.lunch}</div>
          </div>
          <div className="bg-[#18201C] p-2 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">Snacks</div>
            <div className="text-xs font-bold text-white mt-0.5">{mealBreakdown.snack}</div>
          </div>
          <div className="bg-[#18201C] p-2 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">Dinner</div>
            <div className="text-xs font-bold text-white mt-0.5">{mealBreakdown.dinner}</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Burned (Workout + Daily Steps + Base rows)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Burned</span>
          <span className="text-[11px] text-zinc-500">3 sources</span>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-2">
          {totalBurned} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mb-3">
          Total metabolic expenditure
        </div>

        {/* 3 Component Rows: Base, Daily Steps, Workouts */}
        <div className="space-y-2 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18201C] border border-white/[0.02]">
            <div>
              <div className="text-xs font-bold text-white">Base BMR</div>
              <div className="text-[10px] text-zinc-500">Mifflin-St Jeor formula (@ {profile.weightKg} kg)</div>
            </div>
            <div className="text-sm font-black text-white">{bmr} kcal</div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18201C] border border-white/[0.02]">
            <div>
              <div className="text-xs font-bold text-white">Daily Steps</div>
              <div className="text-[10px] text-zinc-500">{(currentDay.steps || 0).toLocaleString()} steps taken</div>
            </div>
            <div className="text-sm font-black text-[#22C55E]">{stepsBurned} kcal</div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18201C] border border-white/[0.02]">
            <div>
              <div className="text-xs font-bold text-white">Workout Sessions</div>
              <div className="text-[10px] text-zinc-500">{currentDay.workouts?.length || 0} training session(s)</div>
            </div>
            <div className="text-sm font-black text-[#22C55E]">{workoutBurned} kcal</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Net
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Net</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            isSurplus ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-rose-500/15 text-rose-400'
          }`}>
            {isSurplus ? 'Surplus' : 'Deficit'}
          </span>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-2">
          {netCalories >= 0 ? `+${netCalories}` : netCalories} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          Consumed ({consumedTotal}) - Burned ({totalBurned}) • Target surplus: +200 to +350 kcal
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 4: Target Bar
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Target Bar</span>
          <span className="text-xs font-bold text-[#22C55E]">{targetPercent}%</span>
        </div>
        <div className="text-3xl font-black text-white tracking-tight my-2">
          {targetGain} <span className="text-lg font-normal text-zinc-500">kcal goal</span>
        </div>
        <div className="h-2.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${targetPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mt-2">
          {consumedTotal} kcal consumed of {targetGain} kcal surplus gain target
        </div>
      </div>
    </div>
  );
};
