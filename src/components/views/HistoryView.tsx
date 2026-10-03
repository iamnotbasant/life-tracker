'use client';

import React, { useState } from 'react';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Moon,
  Zap,
} from 'lucide-react';
import { AppState } from '../../lib/types';
import { YearlyHeatmap } from '../YearlyHeatmap';

interface HistoryViewProps {
  state: AppState;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state }) => {
  const { profile, activeDate, days } = state;
  const [viewFilter, setViewFilter] = useState<'yearly' | 'all' | 'nutrition' | 'fitness'>('yearly');

  // Compute heatmap datasets:
  // 1. Steps heatmap
  const stepsHeatmap: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let stepsTotalDays = 0;
  for (const [dateStr, d] of Object.entries(days)) {
    const val = d.steps || 0;
    const hit = val >= (profile.stepsGoal || 10000);
    if (hit) stepsTotalDays++;
    stepsHeatmap[dateStr] = {
      date: dateStr,
      value: val,
      completed: hit,
      label: `${val.toLocaleString()} steps`,
    };
  }

  // 2. Calisthenics & Workouts heatmap
  const workoutHeatmap: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let workoutTotalDays = 0;
  for (const [dateStr, d] of Object.entries(days)) {
    const count = d.workouts?.length || 0;
    const dur = (d.workouts || []).reduce((sum, w) => sum + (w.durationMin || 0), 0);
    const hit = count > 0 || dur >= 15;
    if (hit) workoutTotalDays++;
    workoutHeatmap[dateStr] = {
      date: dateStr,
      value: dur,
      completed: hit,
      label: `${count} workouts (${dur} min)`,
    };
  }

  // 3. Calorie Surplus Heatmap
  const calorieHeatmap: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let calorieTotalDays = 0;
  for (const [dateStr, d] of Object.entries(days)) {
    const kcal = (d.meals || []).reduce((sum, m) => sum + (m.calories || 0), 0);
    const hit = kcal >= 2200;
    if (hit) calorieTotalDays++;
    calorieHeatmap[dateStr] = {
      date: dateStr,
      value: kcal,
      completed: hit,
      label: `${kcal} kcal food intake`,
    };
  }

  // 4. Protein 85g+ Heatmap
  const proteinHeatmap: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let proteinTotalDays = 0;
  for (const [dateStr, d] of Object.entries(days)) {
    const pro = (d.meals || []).reduce((sum, m) => sum + (m.protein || 0), 0);
    const hit = pro >= (profile.proteinGoalMin || 85);
    if (hit) proteinTotalDays++;
    proteinHeatmap[dateStr] = {
      date: dateStr,
      value: pro,
      completed: hit,
      label: `${pro}g protein`,
    };
  }

  // 5. Sleep & Bedtime Heatmap
  const sleepHeatmap: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let sleepTotalDays = 0;
  for (const [dateStr, d] of Object.entries(days)) {
    const hours = d.sleep?.sleepHours || 0;
    const hit = hours >= 7;
    if (hit) sleepTotalDays++;
    sleepHeatmap[dateStr] = {
      date: dateStr,
      value: hours,
      completed: hit,
      label: `${hours}h sleep`,
    };
  }

  // 6. Daily Points Engine Heatmap
  const pointsHeatmap: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let pointsTotalDays = 0;
  for (const [dateStr, d] of Object.entries(days)) {
    const pts = d.points || 0;
    const hit = pts > 0;
    if (hit) pointsTotalDays++;
    pointsHeatmap[dateStr] = {
      date: dateStr,
      value: pts,
      completed: hit,
      label: `${pts >= 0 ? `+${pts}` : pts} points earned`,
    };
  }

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          HEADER & SEGMENTED VIEW CONTROL (Ref-02 & Ref-04)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Your Habits</span>
            <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/[0.04]">
              (6)
            </span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Consistency matrices for each discipline
          </p>
        </div>

        {/* Ref-02 Segmented View Pill */}
        <div className="flex items-center bg-[#121214] border border-white/[0.06] p-1 rounded-2xl">
          <button
            onClick={() => setViewFilter('yearly')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              viewFilter === 'yearly'
                ? 'bg-[#FACC15] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setViewFilter('fitness')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              viewFilter === 'fitness'
                ? 'bg-[#FACC15] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Fitness
          </button>
          <button
            onClick={() => setViewFilter('nutrition')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              viewFilter === 'nutrition'
                ? 'bg-[#FACC15] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Nutrition
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HABIT MATRICES (Direct Ref-02 design)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Habit 1: Points Engine */}
        {(viewFilter === 'yearly' || viewFilter === 'all') && (
          <YearlyHeatmap
            title="Daily Points"
            subtitle="Overall daily discipline score"
            icon={<Flame className="w-4 h-4 text-[#FACC15]" />}
            accentColor="#FACC15"
            data={pointsHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.points > 0 ? 1 : 0}
            totalDaysCount={pointsTotalDays}
            unitLabel="points"
            targetThreshold={25}
          />
        )}

        {/* Habit 2: Daily Steps (10k goal) */}
        {(viewFilter === 'yearly' || viewFilter === 'fitness') && (
          <YearlyHeatmap
            title="Daily Steps"
            subtitle="Goal: 10,000 steps per day"
            icon={<Footprints className="w-4 h-4 text-[#FACC15]" />}
            accentColor="#FACC15"
            data={stepsHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.steps >= 10000 ? 1 : 0}
            totalDaysCount={stepsTotalDays}
            unitLabel="steps"
            targetThreshold={10000}
          />
        )}

        {/* Habit 3: Calisthenics & Workouts */}
        {(viewFilter === 'yearly' || viewFilter === 'fitness') && (
          <YearlyHeatmap
            title="Calisthenics"
            subtitle="Goal: 15+ min session"
            icon={<Dumbbell className="w-4 h-4 text-[#F95738]" />}
            accentColor="#F95738"
            data={workoutHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.workouts?.length ? 1 : 0}
            totalDaysCount={workoutTotalDays}
            unitLabel="mins"
            targetThreshold={30}
          />
        )}

        {/* Habit 4: Calorie Surplus (2500 kcal) */}
        {(viewFilter === 'yearly' || viewFilter === 'nutrition') && (
          <YearlyHeatmap
            title="Caloric Surplus"
            subtitle="Goal: 2,500 kcal healthy weight gain"
            icon={<Zap className="w-4 h-4 text-[#FACC15]" />}
            accentColor="#FACC15"
            data={calorieHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={calorieTotalDays}
            unitLabel="kcal"
            targetThreshold={2400}
          />
        )}

        {/* Habit 5: Daily Protein 85g+ */}
        {(viewFilter === 'yearly' || viewFilter === 'nutrition') && (
          <YearlyHeatmap
            title="Protein Intake"
            subtitle="Goal: 85g+ daily protein"
            icon={<UtensilsCrossed className="w-4 h-4 text-[#FACC15]" />}
            accentColor="#FACC15"
            data={proteinHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={proteinTotalDays}
            unitLabel="g protein"
            targetThreshold={85}
          />
        )}

        {/* Habit 6: Sleep & 23:30 Bedtime */}
        {(viewFilter === 'yearly' || viewFilter === 'all') && (
          <YearlyHeatmap
            title="Sleep & Bedtime"
            subtitle="Goal: 7–8.5h sleep, asleep by 23:30"
            icon={<Moon className="w-4 h-4 text-zinc-300" />}
            accentColor="#FACC15"
            data={sleepHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={sleepTotalDays}
            unitLabel="hours"
            targetThreshold={7}
          />
        )}
      </div>
    </div>
  );
};
