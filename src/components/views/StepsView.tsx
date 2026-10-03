'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { AppState } from '../../lib/types';
import { estimateStepsCalories } from '../../lib/points';
import { formatDateLabel } from '../../lib/utils';
import { DateNavigator } from '../DateNavigator';

interface StepsViewProps {
  state: AppState;
  onUpdateSteps: (date: string, steps: number, note?: string) => void;
  onOpenQuickLog: (tab: 'steps') => void;
  onDateChange?: (newDate: string) => void;
}

export const StepsView: React.FC<StepsViewProps> = ({
  state,
  onUpdateSteps,
  onOpenQuickLog,
  onDateChange,
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

  // Generate 7-day mini strip data leading up to activeDate
  const sevenDayList = React.useMemo(() => {
    const list: Array<{ date: string; dayLabel: string; steps: number; hit: boolean }> = [];
    const baseDate = new Date(activeDate);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const st = days[dateStr]?.steps || 0;
      const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const dayName = dayLetters[d.getDay()];

      list.push({
        date: dateStr,
        dayLabel: dayName,
        steps: st,
        hit: st >= goal,
      });
    }
    return list;
  }, [activeDate, days, goal]);

  const daysHitGoal = sevenDayList.filter(d => d.hit).length;

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER: Title top-left + circular icon button top-right
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Steps</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Daily step tracking</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickLog('steps')}
            className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
            title="Log Steps"
            aria-label="Log Steps"
          >
            <Plus className="w-5 h-5 text-[#22C55E]" />
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <DateNavigator currentDate={activeDate} onDateChange={onDateChange} />

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Big Number Card
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-semibold text-zinc-400">Today's Steps</div>
        <div className="text-5xl font-black text-white tracking-tight my-2">
          {currentSteps.toLocaleString()}
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          goal {goal.toLocaleString()} • ~{caloriesBurned} kcal burned
        </div>

        {/* Quick increment buttons */}
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
          {[500, 1000, 2500, 5000].map(amt => (
            <button
              key={amt}
              onClick={() => handleAdd(amt)}
              className="flex-1 py-1.5 rounded-xl bg-[#18201C] hover:bg-zinc-800 border border-white/[0.04] text-xs font-semibold text-zinc-300 active:scale-95 transition-all text-center"
            >
              +{amt >= 1000 ? `${amt / 1000}k` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Goal Progress Bar Card
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Goal Progress</span>
          <span className="text-xs font-bold text-[#22C55E]">{progressPercent}%</span>
        </div>
        <div className="text-3xl font-black text-white tracking-tight my-2">
          {progressPercent}%
        </div>
        <div className="h-2.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mt-2">
          {currentSteps.toLocaleString()} of {goal.toLocaleString()} steps
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: 7-day Mini Bar Strip Card
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-zinc-400">7-Day Activity</span>
          <span className="text-[11px] text-zinc-500">{daysHitGoal} of 7 met goal</span>
        </div>

        {/* 7 Vertical Mini Bars */}
        <div className="flex items-end justify-between gap-2 h-28 pt-2">
          {sevenDayList.map((d) => {
            const barHeightRatio = Math.min((d.steps / goal), 1);
            const heightPx = Math.max(8, Math.round(barHeightRatio * 76));
            const isSelected = d.date === activeDate;

            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="text-[10px] text-zinc-500 font-medium truncate">
                  {d.steps > 0 ? (d.steps >= 1000 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps) : '0'}
                </div>
                <div className="w-full max-w-[28px] h-20 bg-[#18201C] rounded-lg overflow-hidden flex flex-col justify-end p-0.5 border border-white/[0.02]">
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      d.hit ? 'bg-[#22C55E]' : d.steps > 0 ? 'bg-[#22C55E]/50' : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPx}px` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-[#22C55E]' : 'text-zinc-500'}`}>
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
