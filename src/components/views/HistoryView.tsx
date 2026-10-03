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
import { DateNavigator } from '../DateNavigator';

interface HistoryViewProps {
  state: AppState;
  onDateChange?: (newDate: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state, onDateChange }) => {
  const { profile, activeDate, days } = state;
  const [viewFilter, setViewFilter] = useState<'all' | 'fitness' | 'nutrition'>('all');

  // Compute heatmap datasets:
  // 1. Points heatmap
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

  // 2. Steps heatmap
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

  // 3. Calisthenics & Workouts heatmap
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

  // 4. Calorie Surplus Heatmap
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

  // 5. Protein 85g+ Heatmap
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

  // 6. Sleep & Bedtime Heatmap
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

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Habits</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Green consistency grids</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-[#121815] border border-white/[0.06] p-1 rounded-xl">
          {(['all', 'fitness', 'nutrition'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setViewFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                viewFilter === tab
                  ? 'bg-[#22C55E] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigator */}
      <DateNavigator currentDate={activeDate} onDateChange={onDateChange} />

      {/* ─────────────────────────────────────────────────────────────
          HABIT CARDS WITH GREEN GITHUB-STYLE HEATMAP GRIDS
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Habit 1: Points Engine */}
        {viewFilter === 'all' && (
          <YearlyHeatmap
            title="Daily Points"
            subtitle="Discipline scoring matrix"
            icon={<Flame className="w-4 h-4 text-[#22C55E]" />}
            accentColor="#22C55E"
            data={pointsHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.points > 0 ? 1 : 0}
            totalDaysCount={pointsTotalDays}
            unitLabel="points"
            targetThreshold={25}
          />
        )}

        {/* Habit 2: Daily Steps (10k goal) */}
        {(viewFilter === 'all' || viewFilter === 'fitness') && (
          <YearlyHeatmap
            title="Daily Steps"
            subtitle="Goal: 10,000 steps per day"
            icon={<Footprints className="w-4 h-4 text-[#22C55E]" />}
            accentColor="#22C55E"
            data={stepsHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.steps >= 10000 ? 1 : 0}
            totalDaysCount={stepsTotalDays}
            unitLabel="steps"
            targetThreshold={10000}
          />
        )}

        {/* Habit 3: Calisthenics & Workouts */}
        {(viewFilter === 'all' || viewFilter === 'fitness') && (
          <YearlyHeatmap
            title="Calisthenics"
            subtitle="Goal: 15+ min session"
            icon={<Dumbbell className="w-4 h-4 text-[#22C55E]" />}
            accentColor="#22C55E"
            data={workoutHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.workouts?.length ? 1 : 0}
            totalDaysCount={workoutTotalDays}
            unitLabel="mins"
            targetThreshold={30}
          />
        )}

        {/* Habit 4: Calorie Surplus (2500 kcal) */}
        {(viewFilter === 'all' || viewFilter === 'nutrition') && (
          <YearlyHeatmap
            title="Caloric Surplus"
            subtitle="Goal: 2,500 kcal healthy weight gain"
            icon={<Zap className="w-4 h-4 text-[#22C55E]" />}
            accentColor="#22C55E"
            data={calorieHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={calorieTotalDays}
            unitLabel="kcal"
            targetThreshold={2400}
          />
        )}

        {/* Habit 5: Daily Protein 85g+ */}
        {(viewFilter === 'all' || viewFilter === 'nutrition') && (
          <YearlyHeatmap
            title="Protein Intake"
            subtitle="Goal: 85g+ daily protein"
            icon={<UtensilsCrossed className="w-4 h-4 text-[#22C55E]" />}
            accentColor="#22C55E"
            data={proteinHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={proteinTotalDays}
            unitLabel="g protein"
            targetThreshold={85}
          />
        )}

        {/* Habit 6: Sleep & 23:30 Bedtime */}
        {viewFilter === 'all' && (
          <YearlyHeatmap
            title="Sleep & Bedtime"
            subtitle="Goal: 7–8.5h sleep, asleep by 23:30"
            icon={<Moon className="w-4 h-4 text-[#22C55E]" />}
            accentColor="#22C55E"
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
