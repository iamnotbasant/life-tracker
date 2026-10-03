'use client';

import React, { useState } from 'react';
import { Footprints, Flame, Plus, CheckCircle2, Calculator, TrendingUp } from 'lucide-react';
import { AppState } from '../../lib/types';
import { estimateStepsCalories } from '../../lib/points';
import { YearlyHeatmap } from '../YearlyHeatmap';
import { formatDateLabel } from '../../lib/utils';

interface StepsViewProps {
  state: AppState;
  onUpdateSteps: (date: string, steps: number, note?: string) => void;
  onOpenQuickLog: (tab: 'steps') => void;
}

export const StepsView: React.FC<StepsViewProps> = ({
  state,
  onUpdateSteps,
  onOpenQuickLog,
}) => {
  const { profile, activeDate, days } = state;
  const currentDay = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  const currentSteps = currentDay.steps || 0;
  const factor = profile.stepCalorieFactor || 0.043;
  const caloriesBurned = estimateStepsCalories(currentSteps, factor);
  const goal = profile.stepsGoal || 10000;
  const progressPercent = Math.min(Math.round((currentSteps / goal) * 100), 100);

  // Quick increment buttons
  const handleAdd = (amt: number) => {
    onUpdateSteps(activeDate, currentSteps + amt);
  };

  // Prepare heatmap data
  const heatmapData: Record<string, { date: string; value: number; completed: boolean; label?: string }> = {};
  let totalStepsAllTime = 0;
  let daysMetGoal = 0;

  for (const [dateStr, d] of Object.entries(days)) {
    const val = d.steps || 0;
    totalStepsAllTime += val;
    if (val >= goal) daysMetGoal++;

    heatmapData[dateStr] = {
      date: dateStr,
      value: val,
      completed: val >= goal,
      label: `${val.toLocaleString()} steps (~${estimateStepsCalories(val, factor)} kcal)`,
    };
  }

  // Recent history sorted desc
  const sortedDates = Object.keys(days).sort((a, b) => b.localeCompare(a)).slice(0, 10);

  return (
    <div className="space-y-5 pb-24">
      {/* ─────────────────────────────────────────────────────────────
          1. STEPS HERO STAT CARD
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0D1D1C] via-[#0E1726] to-[#0A0F1A] border border-[#10B981]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#10B981]/20 text-[#10B981]">
                <Footprints className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
                  Daily Steps Tracker
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {formatDateLabel(activeDate)}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onOpenQuickLog('steps')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-bold text-xs shadow-md shadow-[#10B981]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Steps</span>
            </button>
          </div>

          {/* Big Numerals */}
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                {currentSteps.toLocaleString()}
              </div>
              <div className="text-xs font-medium text-slate-400 mt-1">
                Goal: {goal.toLocaleString()} steps ({progressPercent}% achieved)
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#10B981]">
                ~{caloriesBurned}
              </div>
              <div className="text-xs font-semibold text-slate-400">kcal burned</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-3 w-full bg-[#162335] rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Quick Add:</span>
            {[500, 1000, 2500, 5000].map(amt => (
              <button
                key={amt}
                onClick={() => handleAdd(amt)}
                className="flex-1 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-slate-200 active:scale-95 transition-all text-center"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. EXPLICIT FORMULA FACTOR BANNER (User requirement!)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] shrink-0 mt-0.5">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Scientifically Calibrated Step Factor
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            At Basant's current weight of <strong className="text-white">{profile.weightKg} kg</strong>, energy expenditure is calculated using the factor <strong className="text-[#10B981]">{factor} kcal / step</strong> (~43 kcal per 1,000 steps).
            Formula: <code className="bg-black/30 px-1.5 py-0.5 rounded text-white font-mono">Steps × {factor} = Calories Burned</code>.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. YEARLY HEATMAP (GitHub-style, ref-04)
         ───────────────────────────────────────────────────────────── */}
      <YearlyHeatmap
        title="Steps Consistency Heatmap"
        subtitle="365-day tracking (10,000 steps target)"
        icon={<Footprints className="w-5 h-5 text-[#10B981]" />}
        accentColor="#10B981"
        data={heatmapData}
        currentDate={activeDate}
        streakCount={currentSteps >= goal ? 1 : 0}
        totalDaysCount={daysMetGoal}
        unitLabel="steps"
        targetThreshold={goal}
        actionBadge={
          <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded-lg">
            10k Goal
          </span>
        }
      />

      {/* ─────────────────────────────────────────────────────────────
          4. RECENT STEPS LOG
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Recent Daily Logs
        </h4>
        <div className="space-y-2">
          {sortedDates.map(dateKey => {
            const d = days[dateKey];
            const st = d?.steps || 0;
            const hit = st >= goal;
            return (
              <div
                key={dateKey}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#0C1220] border border-white/[0.06]"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${hit ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-slate-800 text-slate-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{formatDateLabel(dateKey)}</div>
                    {d?.stepsNote && (
                      <div className="text-xs text-slate-400">{d.stepsNote}</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-white">{st.toLocaleString()} steps</div>
                  <div className="text-xs text-[#10B981]">~{estimateStepsCalories(st, factor)} kcal</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
