'use client';

import React from 'react';
import { Utensils, Footprints, Dumbbell, Activity, Heart, Zap, Target } from 'lucide-react';
import { AppState } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';
import { formatDateLabel } from '../../lib/utils';

interface CaloriesViewProps {
  state: AppState;
}

export const CaloriesView: React.FC<CaloriesViewProps> = ({ state }) => {
  const { profile, activeDate, days } = state;
  const currentDay = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  // Block 1: Consumed
  const meals = currentDay.meals || [];
  const consumedTotal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  const mealBreakdown = {
    breakfast: meals.filter(m => m.mealType === 'breakfast').reduce((s, m) => s + m.calories, 0),
    lunch: meals.filter(m => m.mealType === 'lunch').reduce((s, m) => s + m.calories, 0),
    snack: meals.filter(m => m.mealType === 'snack').reduce((s, m) => s + m.calories, 0),
    dinner: meals.filter(m => m.mealType === 'dinner').reduce((s, m) => s + m.calories, 0),
  };

  // Block 2: Burned Split (Mifflin-St Jeor BMR + Steps + Workouts)
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const stepsBurned = estimateStepsCalories(currentDay.steps || 0, profile.stepCalorieFactor);
  const workoutBurned = (currentDay.workouts || []).reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalBurned = bmr + stepsBurned + workoutBurned;

  // Block 3 & 4: Net vs Target
  const netCalories = consumedTotal - totalBurned;
  const isSurplus = netCalories >= 0;
  const targetGain = profile.calorieGoalGain || 2500;

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
          Metabolic Energy
        </span>
        <h3 className="text-lg font-bold text-white tracking-tight">
          {formatDateLabel(activeDate)}
        </h3>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 1: CONSUMED (FOOD)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-[#FACC15]">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider">
                Block 1 • Energy In
              </span>
              <h4 className="text-sm font-bold text-white">Consumed Food Calories</h4>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-[#FACC15]">
              {consumedTotal}
            </div>
            <div className="text-[10px] text-zinc-500 font-semibold uppercase">Total kcal</div>
          </div>
        </div>

        {/* Breakdown by Meal Type */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <div className="bg-zinc-900/60 p-2.5 rounded-2xl border border-white/[0.04]">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Breakfast</span>
            <div className="text-base font-black text-white mt-0.5">{mealBreakdown.breakfast} <span className="text-[10px] font-normal text-zinc-500">kcal</span></div>
          </div>
          <div className="bg-zinc-900/60 p-2.5 rounded-2xl border border-white/[0.04]">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Lunch</span>
            <div className="text-base font-black text-white mt-0.5">{mealBreakdown.lunch} <span className="text-[10px] font-normal text-zinc-500">kcal</span></div>
          </div>
          <div className="bg-zinc-900/60 p-2.5 rounded-2xl border border-white/[0.04]">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Snacks</span>
            <div className="text-base font-black text-white mt-0.5">{mealBreakdown.snack} <span className="text-[10px] font-normal text-zinc-500">kcal</span></div>
          </div>
          <div className="bg-zinc-900/60 p-2.5 rounded-2xl border border-white/[0.04]">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Dinner</span>
            <div className="text-base font-black text-white mt-0.5">{mealBreakdown.dinner} <span className="text-[10px] font-normal text-zinc-500">kcal</span></div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 2: BURNED SPLIT (BMR + STEPS + WORKOUTS)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-zinc-300">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Block 2 • Energy Out
              </span>
              <h4 className="text-sm font-bold text-white">Burned Split (3 Sources)</h4>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">
              {totalBurned}
            </div>
            <div className="text-[10px] text-zinc-500 font-semibold uppercase">Total Burned kcal</div>
          </div>
        </div>

        {/* 3 Components Split Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-zinc-500" />
                <span>Base BMR</span>
              </span>
            </div>
            <div className="text-xl font-black text-white mt-1">{bmr} <span className="text-xs font-normal text-zinc-500">kcal</span></div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Mifflin-St Jeor formula
            </p>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Steps</span>
              </span>
            </div>
            <div className="text-xl font-black text-white mt-1">{stepsBurned} <span className="text-xs font-normal text-zinc-500">kcal</span></div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {(currentDay.steps || 0).toLocaleString()} steps taken
            </p>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-[#F95738]" />
                <span>Workouts</span>
              </span>
            </div>
            <div className="text-xl font-black text-white mt-1">{workoutBurned} <span className="text-xs font-normal text-zinc-500">kcal</span></div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {currentDay.workouts?.length || 0} training session(s)
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 3: NET CALORIES BALANCE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-[#FACC15]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider">
                Block 3 • Energy Balance
              </span>
              <h4 className="text-sm font-bold text-white">Net Daily Balance</h4>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isSurplus
                ? 'bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isSurplus ? 'Caloric Surplus' : 'Caloric Deficit'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.04]">
          <div>
            <div className="text-xs text-zinc-500">Consumed ({consumedTotal}) - Burned ({totalBurned})</div>
            <div className="text-4xl font-black text-white mt-1">
              {netCalories >= 0 ? `+${netCalories}` : netCalories}{' '}
              <span className="text-sm font-normal text-zinc-500">kcal Net</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-500">Target Range</div>
            <div className="text-base font-bold text-[#FACC15] mt-1">+200 to +350 kcal</div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 4: NET VS TARGET PROGRESSION
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FACC15]" />
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Target Progression</h4>
          </div>
          <span className="text-xs font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-lg">
            Goal: {targetGain} kcal
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span>Deficit (&lt;2000)</span>
            <span>Maintain (2300)</span>
            <span className="text-[#FACC15] font-bold">Gain (2500)</span>
          </div>

          <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 flex border border-white/[0.04]">
            <div className="h-full bg-rose-500/40 w-1/4 rounded-l-full" />
            <div className="h-full bg-zinc-700 w-1/4" />
            <div className="h-full bg-[#FACC15] w-1/4" />
            <div className="h-full bg-zinc-800 w-1/4 rounded-r-full" />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-zinc-400">
            <span>Current intake:</span>
            <span className="font-bold text-white">{consumedTotal} kcal consumed</span>
          </div>
        </div>
      </section>
    </div>
  );
};
