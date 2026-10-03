'use client';

import React from 'react';
import { Scale, Plus, TrendingUp, Award } from 'lucide-react';
import { AppState } from '../../lib/types';
import { formatDateLabel } from '../../lib/utils';

interface WeightViewProps {
  state: AppState;
  onLogWeight: (weight: number, note?: string) => void;
  onOpenQuickLog: (tab: 'weight') => void;
}

export const WeightView: React.FC<WeightViewProps> = ({
  state,
  onLogWeight,
  onOpenQuickLog,
}) => {
  const { profile, activeDate, weightHistory } = state;

  const currentWeight = profile.weightKg || 48.9;
  const startWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : 48.2;
  const diff = +(currentWeight - startWeight).toFixed(1);
  const targetWeight = 52.0;

  // Progress towards 52 kg goal
  const totalGainTarget = +(targetWeight - startWeight).toFixed(1);
  const progressRatio = Math.max(0, Math.min(100, Math.round((diff / totalGainTarget) * 100)));

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
            Healthy Weight Gain
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Progression & Baseline
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('weight')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#FDE047] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Weight</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. CURRENT WEIGHT HERO & SPARKLINE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-[#FACC15]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Baseline</span>
              <h4 className="text-xs font-bold text-white">Body Mass Progression</h4>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{diff} kg Gained</span>
          </span>
        </div>

        {/* Big Weight Number */}
        <div className="flex items-baseline justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {currentWeight}
            </span>
            <span className="text-xl font-bold text-zinc-500">kg</span>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-400">Target: {targetWeight} kg</div>
            <div className="text-sm font-bold text-[#FACC15] mt-0.5">{progressRatio}% to goal</div>
          </div>
        </div>

        {/* Trend Sparkline SVG */}
        <div className="mt-6 pt-4 border-t border-white/[0.05]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
            <span>Trend Graph</span>
            <span>Last {weightHistory.length} entries</span>
          </div>

          {/* Sparkline curve */}
          <div className="relative h-16 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FACC15" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FACC15" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points="0,70 50,60 120,45 200,30 280,25 280,80 0,80"
                fill="url(#weightGrad)"
              />
              <polyline
                points="0,70 50,60 120,45 200,30 280,25"
                fill="none"
                stroke="#FACC15"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="0" cy="70" r="3.5" fill="#FACC15" />
              <circle cx="50" cy="60" r="3.5" fill="#FACC15" />
              <circle cx="120" cy="45" r="3.5" fill="#FACC15" />
              <circle cx="200" cy="30" r="3.5" fill="#FACC15" />
              <circle cx="280" cy="25" r="5" fill="#000000" stroke="#FACC15" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono">
            <span>{weightHistory[0]?.date || 'Sep 15'} ({startWeight}kg)</span>
            <span className="text-zinc-300 font-bold">{weightHistory[weightHistory.length - 1]?.date || 'Oct 03'} ({currentWeight}kg)</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MILESTONE CARD (Clean CSS/Lucide icon, NO image per brief)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-[#FACC15] shrink-0">
          <Award className="w-6 h-6" />
        </div>

        <div>
          <div className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider">
            Milestone Achieved
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">
            Phase 1: 48.9 kg Clean Mass
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Consistently surplus-fueled calisthenics. Every weigh-in confirms lean muscle adaptation.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. WEIGHT LOG HISTORY TABLE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
          Weigh-in History
        </h4>
        <div className="space-y-2">
          {weightHistory.slice().reverse().map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-[#FACC15]">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{formatDateLabel(w.date)}</div>
                  {w.note && (
                    <div className="text-[11px] text-zinc-500">{w.note}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-white">{w.weightKg} <span className="text-[10px] font-normal text-zinc-500">kg</span></div>
                <span className="text-[10px] font-bold text-[#FACC15]">
                  +5 Pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
