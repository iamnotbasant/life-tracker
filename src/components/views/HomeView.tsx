'use client';

import React from 'react';
import Image from 'next/image';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Scale,
  ChevronRight,
  TrendingUp,
  Zap,
  Info,
  CheckCircle2,
  Clock,
  Plus,
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

  // Calorie ring progress
  const caloriePercent = Math.min(Math.round((totalKcal / targetKcal) * 100), 100);
  const proteinPercent = Math.min(Math.round((totalProtein / profile.proteinGoalMin) * 100), 100);
  const stepsPercent = Math.min(Math.round((steps / profile.stepsGoal) * 100), 100);

  return (
    <div className="space-y-5 pb-24">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO CARD: TODAY'S POINTS (BIG) + TOTAL POINTS
          The single most important element requested by user
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A120B] via-[#141A2D] to-[#0A0E1A] border border-[#FF5E1E]/30 p-5 sm:p-6 shadow-2xl shadow-[#FF5E1E]/10">
        {/* Ambient flame glow in background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5E1E]/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10">
          {/* Top Label & Info Button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5E1E]/15 border border-[#FF5E1E]/30 text-xs font-bold text-[#FF8800] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span>Today's Score</span>
              </span>
              <span className="text-xs font-semibold text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-full">
                🔥 {streak}d Streak
              </span>
            </div>

            <button
              onClick={onOpenPointsInfo}
              className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1 rounded-xl transition-colors border border-white/10"
              title="How Points Work"
            >
              <Info className="w-3.5 h-3.5 text-[#FFA114]" />
              <span>How it works</span>
            </button>
          </div>

          {/* Points Big Display & Flame Graphic */}
          <div className="flex items-center justify-between gap-4 my-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Daily Points Earned
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-5xl sm:text-6xl font-black tracking-tight ${
                    day.points >= 0
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E1E] via-[#FF8800] to-[#FFA114]'
                      : 'text-rose-400'
                  }`}
                >
                  {day.points >= 0 ? `+${day.points}` : day.points}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-400">
                  PTS
                </span>
              </div>

              {/* Total points tally */}
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="text-[#FFA114] font-bold">{totalAllTimePoints}</span>
                <span>all-time points accumulated</span>
              </div>
            </div>

            {/* Hero Flame Illustration */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 drop-shadow-2xl">
              <Image
                src="/assets/hero-points-flame.png"
                alt="Daily points flame"
                fill
                className="object-contain animate-bounce-slow"
                sizes="(max-width: 640px) 96px, 112px"
                priority
              />
            </div>
          </div>

          {/* Today's Points Breakdown Pills */}
          {day.pointsBreakdown && (
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap gap-1.5">
              {day.pointsBreakdown.caloriesPts !== 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#84CC16]/15 text-[#A3E635] border border-[#84CC16]/20">
                  Fuel: {day.pointsBreakdown.caloriesPts > 0 ? `+${day.pointsBreakdown.caloriesPts}` : day.pointsBreakdown.caloriesPts}
                </span>
              )}
              {day.pointsBreakdown.proteinPts !== 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/20">
                  Protein: {day.pointsBreakdown.proteinPts > 0 ? `+${day.pointsBreakdown.proteinPts}` : day.pointsBreakdown.proteinPts}
                </span>
              )}
              {day.pointsBreakdown.stepsPts !== 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/20">
                  Steps: {day.pointsBreakdown.stepsPts > 0 ? `+${day.pointsBreakdown.stepsPts}` : day.pointsBreakdown.stepsPts}
                </span>
              )}
              {day.pointsBreakdown.workoutPts > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/20">
                  Workout: +{day.pointsBreakdown.workoutPts}
                </span>
              )}
              {day.pointsBreakdown.sleepPts !== 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/20">
                  Sleep: {day.pointsBreakdown.sleepPts > 0 ? `+${day.pointsBreakdown.sleepPts}` : day.pointsBreakdown.sleepPts}
                </span>
              )}
              {day.pointsBreakdown.weightPts > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#F43F5E]/15 text-[#FB7185] border border-[#F43F5E]/20">
                  Weight: +{day.pointsBreakdown.weightPts}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CALORIE CONSUMED VS BURNED VS TARGET RING & METABOLISM
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8B5CF6]/20 text-[#A855F7]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Energy & Surplus</h3>
              <p className="text-xs text-slate-400">Target 2,500 kcal gain / 2,300 maintain</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('calories')}
            className="flex items-center gap-1 text-xs font-semibold text-[#A855F7] hover:underline"
          >
            <span>Full Split</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ring & 3-way Split */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Visual Progress Ring */}
          <div className="flex items-center justify-center py-2 sm:py-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#182238"
                  strokeWidth="8"
                />
                {/* Consumed fill */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#84CC16"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - caloriePercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{totalKcal}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">of 2500 kcal</span>
              </div>
            </div>
          </div>

          {/* 3 Metric Figures */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-2">
            <div className="bg-[#0B101D] p-3 rounded-2xl border border-white/[0.06] text-center">
              <span className="text-[10px] font-bold uppercase text-[#84CC16]">Consumed</span>
              <div className="text-xl font-bold text-white mt-1">{totalKcal}</div>
              <span className="text-[10px] text-slate-400">kcal food</span>
            </div>

            <div className="bg-[#0B101D] p-3 rounded-2xl border border-white/[0.06] text-center">
              <span className="text-[10px] font-bold uppercase text-[#38BDF8]">Total Burned</span>
              <div className="text-xl font-bold text-white mt-1">{totalBurned}</div>
              <span className="text-[10px] text-slate-400">BMR+Steps+Wo</span>
            </div>

            <div className="bg-[#0B101D] p-3 rounded-2xl border border-white/[0.06] text-center">
              <span className="text-[10px] font-bold uppercase text-[#FFA114]">Net / Status</span>
              <div className="text-xl font-bold text-white mt-1">
                {netKcal >= 0 ? `+${netKcal}` : netKcal}
              </div>
              <span className="text-[10px] text-slate-400">
                {netKcal >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>

        {/* Target Range Guidance Bar */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Maintain: 2,300 kcal</span>
            <span className="text-[#84CC16] font-semibold">Healthy Gain: 2,500 kcal</span>
          </div>
          <div className="h-2 w-full bg-[#182238] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] via-[#84CC16] to-[#FFA114] rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TODAY'S MODULE CARDS & QUICK ACCESS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* STEPS CARD */}
        <div
          onClick={() => onSelectTab('steps')}
          className="bg-[#111726] border border-white/[0.08] hover:border-[#10B981]/40 rounded-3xl p-5 shadow-lg cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#10B981]/15 text-[#10B981]">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors">
                  Daily Steps
                </h4>
                <p className="text-xs text-slate-400">Goal: 10,000 steps</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickLog('steps');
              }}
              className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-[#10B981] text-slate-300 hover:text-black transition-all"
              title="Add Steps"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{steps.toLocaleString()}</span>
            <span className="text-xs font-semibold text-[#10B981]">
              ~{stepsBurned} kcal burned
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full bg-[#182238] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>
        </div>

        {/* WORKOUT CARD */}
        <div
          onClick={() => onSelectTab('workout')}
          className="bg-[#111726] border border-white/[0.08] hover:border-[#06B6D4]/40 rounded-3xl p-5 shadow-lg cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#06B6D4]/15 text-[#06B6D4]">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#06B6D4] transition-colors">
                  Calisthenics & Training
                </h4>
                <p className="text-xs text-slate-400">
                  {day.workouts?.length ? `${day.workouts.length} logged today` : 'None logged yet'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickLog('workout');
              }}
              className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-[#06B6D4] text-slate-300 hover:text-black transition-all"
              title="Log Workout"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {day.workouts && day.workouts.length > 0 ? (
            <div className="mt-2">
              <div className="text-base font-bold text-white truncate">
                {day.workouts[0].name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>⏱️ {day.workouts[0].durationMin} mins</span>
                <span>🔥 {day.workouts[0].calories} kcal</span>
                <span className="text-[#06B6D4] font-medium">+10 Pts</span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Log dips, pull-ups, or core</span>
              <span className="text-[#06B6D4] font-bold">+10 Pts</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
            <span>Today's Burn: {workoutBurned} kcal</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* MEALS CARD */}
        <div
          onClick={() => onSelectTab('meals')}
          className="bg-[#111726] border border-white/[0.08] hover:border-[#84CC16]/40 rounded-3xl p-5 shadow-lg cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#84CC16]/15 text-[#84CC16]">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#84CC16] transition-colors">
                  Meals & Protein
                </h4>
                <p className="text-xs text-slate-400">
                  Target: 85–100g protein
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickLog('meal');
              }}
              className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-[#84CC16] text-slate-300 hover:text-black transition-all"
              title="Add Meal"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 rounded-2xl bg-[#0A0F1C] border border-white/[0.06]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Calories</div>
              <div className="text-xl font-black text-white">{totalKcal}</div>
              <div className="text-[10px] text-[#84CC16] font-medium">{caloriePercent}% of 2500</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#0A0F1C] border border-white/[0.06]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Protein</div>
              <div className="text-xl font-black text-white">{totalProtein}g</div>
              <div className="text-[10px] text-[#38BDF8] font-medium">{proteinPercent}% of 85g+</div>
            </div>
          </div>
        </div>

        {/* WEIGHT CARD */}
        <div
          onClick={() => onSelectTab('weight')}
          className="bg-[#111726] border border-white/[0.08] hover:border-[#F43F5E]/40 rounded-3xl p-5 shadow-lg cursor-pointer transition-all card-interactive group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#F43F5E]/15 text-[#F43F5E]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#F43F5E] transition-colors">
                  Weight Progression
                </h4>
                <p className="text-xs text-slate-400">Goal: Healthy Weight Gain</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickLog('weight');
              }}
              className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-[#F43F5E] text-slate-300 hover:text-black transition-all"
              title="Log Weight"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{profile.weightKg}</span>
              <span className="text-sm font-bold text-slate-400">kg</span>
            </div>
            <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+0.7 kg lean mass</span>
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
            <span>Baseline: 48.2 kg ➔ Current: 48.9 kg</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
