'use client';

import React, { useState } from 'react';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Moon,
  Zap,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../../lib/types';
import { YearlyHeatmap } from '../YearlyHeatmap';

interface HistoryViewProps {
  state: AppState;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state }) => {
  const { profile, activeDate, days } = state;
  const [viewFilter, setViewFilter] = useState<'yearly' | 'all' | 'nutrition' | 'fitness'>('yearly');

  // Compute heatmap datasets for each of the core life tracker habits:

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
    const hit = kcal >= 2200; // maintain or gain zone
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
    <div className="space-y-5 pb-24">
      {/* ─────────────────────────────────────────────────────────────
          HEADER & SEGMENTED VIEW CONTROL (Exact ref-04 layout)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Habits & Heatmaps</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A855F7] border border-[#8B5CF6]/30">
              365-Day Grids
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full year GitHub-style activity matrix for every daily discipline
          </p>
        </div>

        {/* Ref-04 Segmented Switcher */}
        <div className="flex items-center bg-[#111726] border border-white/[0.08] p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setViewFilter('yearly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewFilter === 'yearly'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setViewFilter('fitness')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewFilter === 'fitness'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fitness
          </button>
          <button
            onClick={() => setViewFilter('nutrition')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewFilter === 'nutrition'
                ? 'bg-[#8B5CF6] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nutrition
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ONE CARD PER HABIT WITH YEARLY HEATMAP (Direct ref-04 design)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Habit 1: Points Engine */}
        {(viewFilter === 'yearly' || viewFilter === 'all') && (
          <YearlyHeatmap
            title="Daily Points Engine"
            subtitle="Overall discipline & target achievement"
            icon={<Flame className="w-5 h-5" />}
            accentColor="#FF5E1E"
            data={pointsHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.points > 0 ? 1 : 0}
            totalDaysCount={pointsTotalDays}
            unitLabel="points"
            targetThreshold={25}
            actionBadge={
              <span className="text-xs font-bold text-[#FF8800] bg-[#FF5E1E]/15 px-2.5 py-1 rounded-lg">
                Score
              </span>
            }
          />
        )}

        {/* Habit 2: Daily Steps (10k goal) */}
        {(viewFilter === 'yearly' || viewFilter === 'fitness') && (
          <YearlyHeatmap
            title="Daily Steps & Walking"
            subtitle="Goal: 10,000 steps per day"
            icon={<Footprints className="w-5 h-5" />}
            accentColor="#10B981"
            data={stepsHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.steps >= 10000 ? 1 : 0}
            totalDaysCount={stepsTotalDays}
            unitLabel="steps"
            targetThreshold={10000}
            actionBadge={
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded-lg">
                10k
              </span>
            }
          />
        )}

        {/* Habit 3: Calisthenics & Workouts */}
        {(viewFilter === 'yearly' || viewFilter === 'fitness') && (
          <YearlyHeatmap
            title="Calisthenics Workouts"
            subtitle="Parallel bar dips, push-ups, pull-ups, core"
            icon={<Dumbbell className="w-5 h-5" />}
            accentColor="#06B6D4"
            data={workoutHeatmap}
            currentDate={activeDate}
            streakCount={days[activeDate]?.workouts?.length ? 1 : 0}
            totalDaysCount={workoutTotalDays}
            unitLabel="mins"
            targetThreshold={30}
            actionBadge={
              <span className="text-xs font-bold text-[#06B6D4] bg-[#06B6D4]/15 px-2.5 py-1 rounded-lg">
                15m+
              </span>
            }
          />
        )}

        {/* Habit 4: Calorie Surplus (2500 kcal) */}
        {(viewFilter === 'yearly' || viewFilter === 'nutrition') && (
          <YearlyHeatmap
            title="Caloric Surplus Intake"
            subtitle="Goal: 2,500 kcal healthy weight gain"
            icon={<Zap className="w-5 h-5" />}
            accentColor="#F59E0B"
            data={calorieHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={calorieTotalDays}
            unitLabel="kcal"
            targetThreshold={2400}
            actionBadge={
              <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded-lg">
                2.5k kcal
              </span>
            }
          />
        )}

        {/* Habit 5: Daily Protein 85g+ */}
        {(viewFilter === 'yearly' || viewFilter === 'nutrition') && (
          <YearlyHeatmap
            title="Protein Intake (85g+)"
            subtitle="Muscle protein synthesis & hypertrophy"
            icon={<UtensilsCrossed className="w-5 h-5" />}
            accentColor="#84CC16"
            data={proteinHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={proteinTotalDays}
            unitLabel="grams protein"
            targetThreshold={85}
            actionBadge={
              <span className="text-xs font-bold text-[#84CC16] bg-[#84CC16]/15 px-2.5 py-1 rounded-lg">
                85g+
              </span>
            }
          />
        )}

        {/* Habit 6: Sleep & 23:30 Bedtime */}
        {(viewFilter === 'yearly' || viewFilter === 'all') && (
          <YearlyHeatmap
            title="Sleep & Circadian Rhythm"
            subtitle="Goal: 7–8.5h sleep, asleep by 23:30"
            icon={<Moon className="w-5 h-5" />}
            accentColor="#8B5CF6"
            data={sleepHeatmap}
            currentDate={activeDate}
            streakCount={0}
            totalDaysCount={sleepTotalDays}
            unitLabel="hours"
            targetThreshold={7}
            actionBadge={
              <span className="text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/15 px-2.5 py-1 rounded-lg">
                7-8.5h
              </span>
            }
          />
        )}
      </div>
    </div>
  );
};
