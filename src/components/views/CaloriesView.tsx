'use client';

import React from 'react';
import { Flame, Utensils, Footprints, Dumbbell, Activity, Heart, ArrowRight, Zap, Target } from 'lucide-react';
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
  const targetMaintain = profile.calorieGoalMaintain || 2300;

  // Net relative percentage
  const surplusTarget = targetGain - totalBurned;

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
          Metabolic Energy Breakdown
        </span>
        <h3 className="text-xl font-black text-white tracking-tight">
          {formatDateLabel(activeDate)}
        </h3>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 1: CONSUMED (FOOD)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#84CC16]/15 text-[#84CC16]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#84CC16] uppercase tracking-wider">
                Block 1 • Energy In
              </span>
              <h4 className="text-base font-bold text-white">Consumed Food Calories</h4>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-[#84CC16]">
              {consumedTotal}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total kcal</div>
          </div>
        </div>

        {/* Breakdown by Meal Type */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <div className="bg-[#0C1220] p-3 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase text-slate-400">Breakfast</span>
            <div className="text-lg font-black text-white mt-0.5">{mealBreakdown.breakfast} <span className="text-xs font-normal text-slate-400">kcal</span></div>
          </div>
          <div className="bg-[#0C1220] p-3 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase text-slate-400">Lunch</span>
            <div className="text-lg font-black text-white mt-0.5">{mealBreakdown.lunch} <span className="text-xs font-normal text-slate-400">kcal</span></div>
          </div>
          <div className="bg-[#0C1220] p-3 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase text-slate-400">Snacks</span>
            <div className="text-lg font-black text-white mt-0.5">{mealBreakdown.snack} <span className="text-xs font-normal text-slate-400">kcal</span></div>
          </div>
          <div className="bg-[#0C1220] p-3 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase text-slate-400">Dinner</span>
            <div className="text-lg font-black text-white mt-0.5">{mealBreakdown.dinner} <span className="text-xs font-normal text-slate-400">kcal</span></div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 2: BURNED SPLIT (WORKOUT + STEPS + BASE BMR)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                Block 2 • Energy Out
              </span>
              <h4 className="text-base font-bold text-white">Burned Split (3 Components)</h4>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-[#38BDF8]">
              {totalBurned}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Burned kcal</div>
          </div>
        </div>

        {/* 3 Components Split Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sub A: Base BMR */}
          <div className="bg-[#0C1220] p-4 rounded-2xl border border-white/[0.06] relative">
            <div className="flex items-center justify-between text-xs font-bold text-[#A855F7] mb-1">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Base BMR</span>
              </span>
              <span className="bg-[#A855F7]/15 px-2 py-0.5 rounded-md">Mifflin-St Jeor</span>
            </div>
            <div className="text-2xl font-black text-white mt-2">{bmr} <span className="text-xs font-normal text-slate-400">kcal</span></div>
            <p className="text-[10px] text-slate-400 mt-2 leading-normal">
              Male, {profile.weightKg} kg, {profile.heightCm} cm, {profile.age}y baseline metabolic rate.
            </p>
          </div>

          {/* Sub B: Steps & Walks */}
          <div className="bg-[#0C1220] p-4 rounded-2xl border border-white/[0.06] relative">
            <div className="flex items-center justify-between text-xs font-bold text-[#10B981] mb-1">
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" />
                <span>Steps & Walk</span>
              </span>
              <span className="bg-[#10B981]/15 px-2 py-0.5 rounded-md">~0.043/step</span>
            </div>
            <div className="text-2xl font-black text-white mt-2">{stepsBurned} <span className="text-xs font-normal text-slate-400">kcal</span></div>
            <p className="text-[10px] text-slate-400 mt-2 leading-normal">
              From {(currentDay.steps || 0).toLocaleString()} steps taken today.
            </p>
          </div>

          {/* Sub C: Workout */}
          <div className="bg-[#0C1220] p-4 rounded-2xl border border-white/[0.06] relative">
            <div className="flex items-center justify-between text-xs font-bold text-[#06B6D4] mb-1">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Workouts</span>
              </span>
              <span className="bg-[#06B6D4]/15 px-2 py-0.5 rounded-md">Calisthenics</span>
            </div>
            <div className="text-2xl font-black text-white mt-2">{workoutBurned} <span className="text-xs font-normal text-slate-400">kcal</span></div>
            <p className="text-[10px] text-slate-400 mt-2 leading-normal">
              From {currentDay.workouts?.length || 0} active training sessions.
            </p>
          </div>
        </div>

        {/* Mifflin-St Jeor formula explainer note */}
        <div className="mt-4 p-3 rounded-2xl bg-black/30 border border-white/[0.04] text-[11px] text-slate-400">
          <strong className="text-slate-300">Mifflin-St Jeor Formula:</strong> <code className="text-[#A855F7] font-mono">10 × {profile.weightKg}kg + 6.25 × {profile.heightCm}cm - 5 × {profile.age}y + 5 = {bmr} kcal/day</code>.
          Adjust age and height anytime in Settings.
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 3: NET CALORIES BALANCE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#FFA114]/15 text-[#FFA114]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#FFA114] uppercase tracking-wider">
                Block 3 • Energy Balance
              </span>
              <h4 className="text-base font-bold text-white">Net Daily Balance</h4>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isSurplus
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isSurplus ? 'Caloric Surplus (Growth)' : 'Caloric Deficit'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3 p-4 rounded-2xl bg-[#0B101D] border border-white/[0.06]">
          <div>
            <div className="text-xs text-slate-400">Consumed ({consumedTotal}) - Burned ({totalBurned})</div>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              {netCalories >= 0 ? `+${netCalories}` : netCalories}{' '}
              <span className="text-base font-semibold text-slate-400">kcal Net</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Target Surplus</div>
            <div className="text-lg font-bold text-[#84CC16] mt-1">+200 to +350 kcal</div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BLOCK 4: NET VS TARGET BAR
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#FF5E1E]/15 text-[#FF5E1E]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#FF5E1E] uppercase tracking-wider">
                Block 4 • Target Band
              </span>
              <h4 className="text-base font-bold text-white">Net vs Target Progression</h4>
            </div>
          </div>
          <span className="text-xs font-bold text-white bg-white/[0.06] px-2.5 py-1 rounded-xl">
            Goal: {targetGain} kcal
          </span>
        </div>

        {/* Visual Target Zone Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Deficit (&lt;2000)</span>
            <span>Maintain (2300)</span>
            <span className="text-[#84CC16] font-bold">Healthy Gain (2500)</span>
            <span>Surplus (2900+)</span>
          </div>

          <div className="h-4 w-full bg-[#182238] rounded-full overflow-hidden p-0.5 flex">
            {/* Deficit Zone */}
            <div className="h-full bg-rose-500/40 w-1/4 rounded-l-full" title="Deficit (<2000)" />
            {/* Maintain Zone */}
            <div className="h-full bg-amber-500/40 w-1/4" title="Maintain (2200-2400)" />
            {/* Gain Zone (Target) */}
            <div className="h-full bg-emerald-500/80 w-1/4" title="Healthy Gain (2400-2650)" />
            {/* High Surplus */}
            <div className="h-full bg-purple-500/40 w-1/4 rounded-r-full" title="High (>2900)" />
          </div>

          {/* Current position needle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Current intake:</span>
            <span className="font-bold text-white text-sm">{consumedTotal} kcal consumed</span>
          </div>
        </div>
      </section>
    </div>
  );
};
