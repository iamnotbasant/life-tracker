'use client';

import React from 'react';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Scale,
  ChevronRight,
  Plus,
  Info,
} from 'lucide-react';
import { AppState, TabType } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';

interface HomeViewProps {
  state: AppState;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog: (tab?: 'steps' | 'meal' | 'walk' | 'workout' | 'weight') => void;
  onOpenPointsInfo: () => void;
  streak: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onSelectTab,
  onOpenQuickLog,
  onOpenPointsInfo,
  streak,
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

  // Calculations for today
  const steps = day.steps || 0;
  const stepsBurned = estimateStepsCalories(steps, profile.stepCalorieFactor);
  const workoutBurned = (day.workouts || []).reduce((sum, w) => sum + (w.calories || 0), 0);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const totalBurned = bmr + stepsBurned + workoutBurned;

  const totalKcal = (day.meals || []).reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = (day.meals || []).reduce((sum, m) => sum + (m.protein || 0), 0);

  const netKcal = totalKcal - totalBurned;
  const targetKcal = profile.calorieGoalGain; // 2500 kcal

  // All-time total points
  const totalAllTimePoints = Object.values(days).reduce((sum, d) => sum + (d.points || 0), 0);

  // Percentages
  const caloriePercent = Math.min(Math.round((totalKcal / targetKcal) * 100), 100);
  const stepsPercent = Math.min(Math.round((steps / profile.stepsGoal) * 100), 100);
  const proteinPercent = Math.min(Math.round((totalProtein / profile.proteinGoalMin) * 100), 100);

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. POINTS HERO (Simple, typography-led, NO flame art overload)
          Rule 5: points hero (simple)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
              Daily Score
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-semibold text-zinc-400">
              🔥 {streak}d Streak
            </span>
          </div>

          <button
            onClick={onOpenPointsInfo}
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1 rounded-xl transition-colors border border-white/[0.06]"
            title="How Points Work"
          >
            <Info className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Rules</span>
          </button>
        </div>

        {/* Big Numerals */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-black tracking-tight ${day.points >= 0 ? 'text-[#FACC15]' : 'text-rose-400'}`}>
                {day.points >= 0 ? `+${day.points}` : day.points}
              </span>
              <span className="text-xl font-bold text-zinc-500">PTS</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              <span className="text-zinc-200 font-semibold">{totalAllTimePoints}</span> all-time points accumulated
            </div>
          </div>

          {/* Quick Log Points Button */}
          <button
            onClick={() => onOpenQuickLog('steps')}
            className="px-3.5 py-2 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold border border-white/[0.08] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Log Activity</span>
          </button>
        </div>

        {/* Subtle breakdown pills */}
        {day.pointsBreakdown && (
          <div className="mt-5 pt-4 border-t border-white/[0.05] flex flex-wrap gap-2 text-[11px]">
            {day.pointsBreakdown.caloriesPts !== 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-zinc-800/60 text-zinc-300 border border-white/[0.04]">
                Fuel: <strong className="text-[#FACC15]">{day.pointsBreakdown.caloriesPts > 0 ? `+${day.pointsBreakdown.caloriesPts}` : day.pointsBreakdown.caloriesPts}</strong>
              </span>
            )}
            {day.pointsBreakdown.proteinPts !== 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-zinc-800/60 text-zinc-300 border border-white/[0.04]">
                Protein: <strong className="text-[#FACC15]">{day.pointsBreakdown.proteinPts > 0 ? `+${day.pointsBreakdown.proteinPts}` : day.pointsBreakdown.proteinPts}</strong>
              </span>
            )}
            {day.pointsBreakdown.stepsPts !== 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-zinc-800/60 text-zinc-300 border border-white/[0.04]">
                Steps: <strong className="text-[#FACC15]">{day.pointsBreakdown.stepsPts > 0 ? `+${day.pointsBreakdown.stepsPts}` : day.pointsBreakdown.stepsPts}</strong>
              </span>
            )}
            {day.pointsBreakdown.workoutPts > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-zinc-800/60 text-zinc-300 border border-white/[0.04]">
                Workout: <strong className="text-[#F95738]">+{day.pointsBreakdown.workoutPts}</strong>
              </span>
            )}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CALORIE RING CARD
          Rule 5: calorie ring
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Energy & Surplus
            </span>
            <div className="text-xs text-zinc-500 mt-0.5">Target: 2,500 kcal gain</div>
          </div>
          <button
            onClick={() => onSelectTab('calories')}
            className="flex items-center gap-1 text-xs font-semibold text-[#FACC15] hover:underline"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Circular Ring */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1C1C1E"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#FACC15"
                  strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - caloriePercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{totalKcal}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">of 2500</span>
              </div>
            </div>
          </div>

          {/* 3 Metric Figures */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-2">
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-white/[0.04] text-center">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Consumed</span>
              <div className="text-lg font-bold text-white mt-1">{totalKcal}</div>
              <span className="text-[10px] text-zinc-500">kcal food</span>
            </div>

            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-white/[0.04] text-center">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Burned</span>
              <div className="text-lg font-bold text-white mt-1">{totalBurned}</div>
              <span className="text-[10px] text-zinc-500">BMR+Steps+Wo</span>
            </div>

            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-white/[0.04] text-center">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Net</span>
              <div className="text-lg font-bold text-[#FACC15] mt-1">
                {netKcal >= 0 ? `+${netKcal}` : netKcal}
              </div>
              <span className="text-[10px] text-zinc-500">
                {netKcal >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MAX 4 COMPACT MODULE ROWS (Clean, typography-led)
          Rule 5: max 4 compact module rows. That's it.
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
          Daily Tracking
        </div>

        {/* Row 1: Steps */}
        <div
          onClick={() => onSelectTab('steps')}
          className="bg-[#121214] border border-white/[0.06] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-300 group-hover:text-[#FACC15] transition-colors">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-[#FACC15] transition-colors">
                Daily Steps
              </div>
              <div className="text-xs text-zinc-400">
                Goal: {profile.stepsGoal.toLocaleString()} • {stepsBurned} kcal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-base font-black text-white">{steps.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-[#FACC15]">{stepsPercent}%</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
          </div>
        </div>

        {/* Row 2: Calisthenics & Workouts */}
        <div
          onClick={() => onSelectTab('workout')}
          className="bg-[#121214] border border-white/[0.06] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-300 group-hover:text-[#F95738] transition-colors">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-[#F95738] transition-colors">
                Calisthenics & Training
              </div>
              <div className="text-xs text-zinc-400">
                {day.workouts?.length ? `${day.workouts.length} session logged (${workoutBurned} kcal)` : 'Goal: 15+ min session (+10 pts)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-base font-black text-white">
                {day.workouts?.length ? `${day.workouts[0].durationMin}m` : '0m'}
              </div>
              <div className="text-[10px] font-bold text-[#F95738]">
                {day.workouts?.length ? '+10 PTS' : 'Pending'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
          </div>
        </div>

        {/* Row 3: Meals & Protein */}
        <div
          onClick={() => onSelectTab('meals')}
          className="bg-[#121214] border border-white/[0.06] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-300 group-hover:text-[#FACC15] transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-[#FACC15] transition-colors">
                Nutrition & Protein
              </div>
              <div className="text-xs text-zinc-400">
                Target: {profile.proteinGoalMin}–{profile.proteinGoalMax}g protein
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-base font-black text-white">{totalProtein}g</div>
              <div className="text-[10px] font-bold text-[#FACC15]">{proteinPercent}% protein</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
          </div>
        </div>

        {/* Row 4: Weight Progression */}
        <div
          onClick={() => onSelectTab('weight')}
          className="bg-[#121214] border border-white/[0.06] hover:border-white/15 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-300 group-hover:text-[#F95738] transition-colors">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-[#F95738] transition-colors">
                Weight Progression
              </div>
              <div className="text-xs text-zinc-400">
                Goal: 52.0 kg clean mass (+0.7 kg gained)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-base font-black text-white">{profile.weightKg} kg</div>
              <div className="text-[10px] font-bold text-emerald-400">Phase 1</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
          </div>
        </div>
      </section>
    </div>
  );
};
