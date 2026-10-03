'use client';

import React from 'react';
import { Footprints, Plus, CheckCircle2, Calculator } from 'lucide-react';
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
  let daysMetGoal = 0;

  for (const [dateStr, d] of Object.entries(days)) {
    const val = d.steps || 0;
    if (val >= goal) daysMetGoal++;

    heatmapData[dateStr] = {
      date: dateStr,
      value: val,
      completed: val >= goal,
      label: `${val.toLocaleString()} steps (~${estimateStepsCalories(val, factor)} kcal)`,
    };
  }

  // Recent history sorted desc
  const sortedDates = Object.keys(days).sort((a, b) => b.localeCompare(a)).slice(0, 7);

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. STEPS HERO STAT CARD (Typography-led, Ref-01 & Ref-03 style)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-[#FACC15]">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
                Daily Steps
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {formatDateLabel(activeDate)}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onOpenQuickLog('steps')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black font-bold text-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Steps</span>
          </button>
        </div>

        {/* Big Numerals */}
        <div className="flex items-baseline justify-between mt-3">
          <div>
            <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {currentSteps.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Goal: {goal.toLocaleString()} steps ({progressPercent}% achieved)
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-[#FACC15]">
              ~{caloriesBurned}
            </div>
            <div className="text-[11px] font-medium text-zinc-400">kcal burned</div>
          </div>
        </div>

        {/* Thick minimal progress bar */}
        <div className="mt-5 h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.04]">
          <div
            className="h-full bg-[#FACC15] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Increment Buttons */}
        <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 mr-1">Add:</span>
          {[500, 1000, 2500, 5000].map(amt => (
            <button
              key={amt}
              onClick={() => handleAdd(amt)}
              className="flex-1 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-xs font-bold text-zinc-200 active:scale-95 transition-all text-center"
            >
              +{amt}
            </button>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SCIENTIFIC CALIBRATION BANNER (Clean caption)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-zinc-900 text-[#FACC15] shrink-0">
          <Calculator className="w-4 h-4" />
        </div>
        <p className="text-xs text-zinc-400 leading-normal">
          Calibrated at <span className="text-white font-medium">{profile.weightKg} kg</span>: <code className="text-[#FACC15] font-mono">Steps × {factor} = Calories Burned</code> (~43 kcal per 1,000 steps).
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. YEARLY HEATMAP (GitHub-style, Ref-02 / Ref-04)
         ───────────────────────────────────────────────────────────── */}
      <YearlyHeatmap
        title="Steps Consistency"
        subtitle="365-day tracking (10,000 steps target)"
        icon={<Footprints className="w-5 h-5 text-[#FACC15]" />}
        accentColor="#FACC15"
        data={heatmapData}
        currentDate={activeDate}
        streakCount={currentSteps >= goal ? 1 : 0}
        totalDaysCount={daysMetGoal}
        unitLabel="steps"
        targetThreshold={goal}
        actionBadge={
          <span className="text-xs font-bold text-[#FACC15] bg-[#FACC15]/10 px-2.5 py-1 rounded-lg border border-[#FACC15]/20">
            10k Goal
          </span>
        }
      />

      {/* ─────────────────────────────────────────────────────────────
          4. RECENT STEPS LOG (Clean rows, Ref-04 style)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
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
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${hit ? 'bg-[#FACC15]/15 text-[#FACC15]' : 'bg-zinc-800 text-zinc-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{formatDateLabel(dateKey)}</div>
                    {d?.stepsNote && (
                      <div className="text-xs text-zinc-400">{d.stepsNote}</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-white">{st.toLocaleString()} steps</div>
                  <div className="text-xs text-[#FACC15]">~{estimateStepsCalories(st, factor)} kcal</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
