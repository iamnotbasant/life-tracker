'use client';

import React from 'react';
import { ArrowLeft, Plus, Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AppState, WeightEntry } from '../../lib/types';
import { formatDateLabel, cn } from '../../lib/utils';
import { DateNavigator } from '../DateNavigator';

interface WeightViewProps {
  state: AppState;
  onLogWeight: (weight: number, note?: string) => void;
  onOpenQuickLog: (tab: 'weight') => void;
  onBack: () => void;
  onSelectTab?: (tab: any) => void;
  onDateChange?: (newDate: string) => void;
}

export const WeightView: React.FC<WeightViewProps> = ({
  state,
  onOpenQuickLog,
  onBack,
  onDateChange,
}) => {
  const { profile, activeDate, weightHistory } = state;

  // Chronological order for computing changes vs previous entry
  const chronological = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));

  const entriesWithDiff = chronological.map((entry, idx) => {
    let diff: number | null = null;
    if (idx > 0) {
      diff = +(entry.weightKg - chronological[idx - 1].weightKg).toFixed(1);
    }
    return {
      ...entry,
      diff,
    };
  });

  // Newest first as requested
  const newestFirst = [...entriesWithDiff].reverse();

  const currentWeight =
    chronological.length > 0
      ? chronological[chronological.length - 1].weightKg
      : profile.weightKg || 48.9;

  const startWeight = chronological.length > 0 ? chronological[0].weightKg : 48.9;
  const totalChange = +(currentWeight - startWeight).toFixed(1);
  const targetWeight = 52.0;

  // Trend visual calculations
  const minWeight = Math.min(...chronological.map((w) => w.weightKg), targetWeight - 5);
  const maxWeight = Math.max(...chronological.map((w) => w.weightKg), targetWeight);
  const weightSpan = Math.max(maxWeight - minWeight, 2);

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER: Back button + Title + Quick Log (+) button
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Weight</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Day-wise mass tracking & trend</p>
          </div>
        </div>

        <button
          onClick={() => onOpenQuickLog('weight')}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="Log Weigh-In"
          aria-label="Log Weigh-In"
        >
          <Plus className="w-5 h-5 text-[#22C55E]" />
        </button>
      </div>

      {/* Date Navigator */}
      <DateNavigator currentDate={activeDate} onDateChange={onDateChange} />

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Big-Number Card (Current Weight & Target)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Current Weight</span>
          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-lg">
            Phase 1 Clean Bulk
          </span>
        </div>
        <div className="text-5xl font-black text-white tracking-tight my-2">
          {currentWeight} <span className="text-2xl font-normal text-zinc-500">kg</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalChange >= 0 ? `+${totalChange}` : totalChange} kg from start • Target: {targetWeight} kg
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Trend Visual (Bars of history)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400">Weight Trend</span>
          <span className="text-[11px] text-zinc-500">
            {chronological.length} {chronological.length === 1 ? 'entry' : 'entries'} logged
          </span>
        </div>

        {chronological.length > 0 ? (
          <div className="flex items-end gap-2 h-24 bg-[#0E1411] p-3 rounded-xl border border-white/[0.04]">
            {chronological.map((w, idx) => {
              const heightPercent = Math.min(
                Math.max(Math.round(((w.weightKg - (minWeight - 0.5)) / weightSpan) * 100), 20),
                100
              );
              const isLatest = idx === chronological.length - 1;
              return (
                <div key={w.id} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <div className="text-[10px] font-bold text-zinc-300">{w.weightKg}</div>
                  <div
                    className={cn(
                      'w-full rounded-md transition-all duration-300',
                      isLatest
                        ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                        : 'bg-[#22C55E]/60'
                    )}
                    style={{ height: `${heightPercent}%` }}
                    title={`${w.date}: ${w.weightKg} kg`}
                  />
                  <span className="text-[9px] text-zinc-500 font-mono truncate w-full text-center">
                    {w.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center text-xs text-zinc-500">
            No weigh-in data yet
          </div>
        )}

        <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
          <span>Start: {startWeight} kg</span>
          <span className="text-[#22C55E] font-semibold">Target: {targetWeight} kg</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Log Weigh-In Action Card
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-white">Daily Weigh-In</div>
            <div className="text-[11px] text-zinc-500">Morning empty-stomach weight (+5 pts)</div>
          </div>
          <Scale className="w-5 h-5 text-[#22C55E]" />
        </div>

        <button
          onClick={() => onOpenQuickLog('weight')}
          className="w-full py-3.5 rounded-xl bg-[#22C55E] text-black font-bold text-sm hover:bg-[#16A34A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Weigh-In (+5 Pts)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DAY-WISE HISTORY LIST: newest first
          date -> weight -> change vs previous entry as green/red chip
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-zinc-400 px-1 flex items-center justify-between">
          <span>Day-Wise History</span>
          <span className="text-[11px] text-zinc-500">Newest first</span>
        </div>

        {newestFirst.length === 0 ? (
          <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-8 text-center flex flex-col items-center">
            <Scale className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No weight logs recorded</p>
          </div>
        ) : (
          newestFirst.map((entry) => {
            const hasGained = entry.diff !== null && entry.diff > 0;
            const hasLost = entry.diff !== null && entry.diff < 0;
            const hasSame = entry.diff !== null && entry.diff === 0;

            return (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-[#121815] border border-white/[0.05] flex items-center justify-between gap-3 shadow-sm hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{formatDateLabel(entry.date)}</span>
                    {entry.date === activeDate && (
                      <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.2 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  {entry.note ? (
                    <div className="text-[11px] text-zinc-400 mt-0.5">{entry.note}</div>
                  ) : (
                    <div className="text-[11px] text-zinc-500 mt-0.5">Morning weigh-in</div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Change vs previous entry chip (green if gained, red if lost — user is bulking) */}
                  {entry.diff === null ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                      Baseline
                    </span>
                  ) : hasGained ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 inline-flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{entry.diff} kg
                    </span>
                  ) : hasLost ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      {entry.diff} kg
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/[0.06] inline-flex items-center gap-0.5">
                      <Minus className="w-3 h-3" />
                      0.0 kg
                    </span>
                  )}

                  <div className="text-right min-w-[70px]">
                    <div className="text-xl font-black text-white tracking-tight">
                      {entry.weightKg} <span className="text-xs font-normal text-zinc-500">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
