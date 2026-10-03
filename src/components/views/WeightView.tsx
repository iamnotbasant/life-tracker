'use client';

import React from 'react';
import Image from 'next/image';
import { Scale, Plus, TrendingUp, Award, Calendar, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { AppState, WeightEntry } from '../../lib/types';
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
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#F43F5E] uppercase tracking-wider">
            Healthy Weight Gain
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Progression & Milestones
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('weight')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#F43F5E] to-[#FB7185] text-white font-bold text-xs shadow-lg shadow-[#F43F5E]/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Weight</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. CURRENT WEIGHT HERO & SPARKLINE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#200D16] via-[#161226] to-[#0D101C] border border-[#F43F5E]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-[#F43F5E]/20 text-[#F43F5E]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Baseline</span>
              <h4 className="text-sm font-bold text-white">Basant's Body Mass</h4>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
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
            <span className="text-2xl font-black text-slate-400">kg</span>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-white">Target: {targetWeight} kg</div>
            <div className="text-xs text-[#F43F5E] font-semibold mt-0.5">{progressRatio}% to goal</div>
          </div>
        </div>

        {/* Trend Sparkline SVG */}
        <div className="mt-6 pt-4 border-t border-white/[0.08]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Trend Graph (Baseline ➔ Current)</span>
            <span className="text-slate-400 font-normal">Last {weightHistory.length} weigh-ins</span>
          </div>

          {/* Sparkline curve */}
          <div className="relative h-20 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Area */}
              <polygon
                points="0,70 50,60 120,45 200,30 280,25 280,80 0,80"
                fill="url(#weightGrad)"
              />
              {/* Line */}
              <polyline
                points="0,70 50,60 120,45 200,30 280,25"
                fill="none"
                stroke="#F43F5E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Points */}
              <circle cx="0" cy="70" r="4" fill="#F43F5E" />
              <circle cx="50" cy="60" r="4" fill="#F43F5E" />
              <circle cx="120" cy="45" r="4" fill="#F43F5E" />
              <circle cx="200" cy="30" r="4" fill="#F43F5E" />
              <circle cx="280" cy="25" r="6" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="3" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>{weightHistory[0]?.date || 'Sep 15'} ({startWeight}kg)</span>
            <span className="text-white font-bold">{weightHistory[weightHistory.length - 1]?.date || 'Oct 03'} ({currentWeight}kg)</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MILESTONE BADGE CARD (Wiring in badge-weight-gain.png!)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#171F36] via-[#1A1830] to-[#141829] border border-white/10 rounded-3xl p-5 shadow-xl flex items-center gap-4">
        {/* Milestone Badge Asset */}
        <div className="relative w-20 h-20 shrink-0 drop-shadow-xl">
          <Image
            src="/assets/badge-weight-gain.png"
            alt="Weight Gain Milestone Badge"
            fill
            className="object-contain"
            sizes="80px"
            priority
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFA114] uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#FFA114]" />
            <span>Milestone Achieved</span>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Phase 1: 48.9 kg Clean Mass
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Consistently surplus-fueled calisthenics training. Every weigh-in confirms lean muscle adaptation!
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. WEIGHT LOG HISTORY TABLE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Weigh-in History
        </h4>
        <div className="space-y-2">
          {weightHistory.slice().reverse().map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B101D] border border-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#F43F5E]/15 text-[#F43F5E]">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{formatDateLabel(w.date)}</div>
                  {w.note && (
                    <div className="text-xs text-slate-400">{w.note}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-white">{w.weightKg} <span className="text-xs font-normal text-slate-400">kg</span></div>
                <span className="text-[10px] font-bold text-[#10B981] bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  +5 Pts Earned
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
