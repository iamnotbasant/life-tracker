'use client';

import React from 'react';
import { Plus, Scale } from 'lucide-react';
import { AppState } from '../../lib/types';
import { formatDateLabel } from '../../lib/utils';

interface WeightViewProps {
  state: AppState;
  onLogWeight: (weight: number, note?: string) => void;
  onOpenQuickLog: (tab: 'weight') => void;
  onSelectTab?: (tab: any) => void;
}

export const WeightView: React.FC<WeightViewProps> = ({
  state,
  onOpenQuickLog,
  onSelectTab,
}) => {
  const { profile, activeDate, weightHistory } = state;

  const currentWeight = profile.weightKg || 48.9;
  const startWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : 48.9;
  const diff = +(currentWeight - startWeight).toFixed(1);
  const targetWeight = 52.0;

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER: Title top-left + circular icon button top-right
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div className="flex items-center gap-2">
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('home')}
              className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <span className="text-xl">←</span>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Weight</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{formatDateLabel(activeDate)}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenQuickLog('weight')}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="Log Weight"
          aria-label="Log Weight"
        >
          <Plus className="w-5 h-5 text-[#22C55E]" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Big-Number Card (48.9 kg)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Current Weight</span>
          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-lg">
            Phase 1 Clean Mass
          </span>
        </div>
        <div className="text-5xl font-black text-white tracking-tight my-2">
          {currentWeight} <span className="text-2xl font-normal text-zinc-500">kg</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {diff >= 0 ? `+${diff}` : diff} kg from start • Target: {targetWeight} kg
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: SVG Sparkline Card
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400">Weight Trend</span>
          <span className="text-[11px] text-zinc-500">{weightHistory.length} entry logged</span>
        </div>

        {/* Clean SVG Sparkline */}
        <div className="relative h-20 w-full flex items-end pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="weightGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon
              points="0,60 100,50 200,40 300,35 300,80 0,80"
              fill="url(#weightGreenGrad)"
            />
            <polyline
              points="0,60 100,50 200,40 300,35"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="60" r="3" fill="#22C55E" />
            <circle cx="100" cy="50" r="3" fill="#22C55E" />
            <circle cx="200" cy="40" r="3" fill="#22C55E" />
            <circle cx="300" cy="35" r="4.5" fill="#0A0F0D" stroke="#22C55E" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
          <span>{weightHistory[0]?.date || 'Oct 02'} ({startWeight} kg)</span>
          <span className="text-zinc-300 font-semibold">{currentWeight} kg</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Log Button Card
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-white">Daily Weigh-In</div>
            <div className="text-[11px] text-zinc-500">Log morning empty-stomach weight (+5 pts)</div>
          </div>
          <Scale className="w-5 h-5 text-[#22C55E]" />
        </div>

        <button
          onClick={() => onOpenQuickLog('weight')}
          className="w-full py-3.5 rounded-xl bg-[#22C55E] text-black font-bold text-sm hover:bg-[#16A34A] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Weigh-In</span>
        </button>
      </div>

      {/* Weigh-in History List */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-zinc-400 px-1">
          History
        </div>

        {weightHistory.slice().reverse().map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121815] border border-white/[0.05]"
          >
            <div>
              <div className="text-xs font-bold text-white">{formatDateLabel(w.date)}</div>
              {w.note && (
                <div className="text-[10px] text-zinc-500 mt-0.5">{w.note}</div>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm font-black text-white">{w.weightKg} <span className="text-[10px] font-normal text-zinc-500">kg</span></div>
              <span className="text-[10px] font-bold text-[#22C55E]">
                +5 pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
