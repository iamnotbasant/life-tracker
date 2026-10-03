'use client';

import React from 'react';
import { Footprints, Plus, Clock, Flame, MapPin, HeartPulse, Trash2 } from 'lucide-react';
import { AppState, WalkSession } from '../../lib/types';
import { formatDateLabel } from '../../lib/utils';

interface WalkViewProps {
  state: AppState;
  onAddWalk: (walk: WalkSession) => void;
  onDeleteWalk: (walkId: string) => void;
  onOpenQuickLog: (tab: 'walk') => void;
}

export const WalkView: React.FC<WalkViewProps> = ({
  state,
  onAddWalk,
  onDeleteWalk,
  onOpenQuickLog,
}) => {
  const { activeDate, days } = state;
  const currentDay = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  const walks = currentDay.walks || [];

  // Totals for today's walks
  const totalWalkSteps = walks.reduce((sum, w) => sum + (w.steps || 0), 0);
  const totalWalkKm = walks.reduce((sum, w) => sum + (w.distanceKm || 0), 0);
  const totalWalkMin = walks.reduce((sum, w) => sum + (w.durationMin || 0), 0);
  const totalWalkKcal = walks.reduce((sum, w) => sum + (w.calories || 0), 0);

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#F95738] uppercase tracking-wider">
            Walking Sessions
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {formatDateLabel(activeDate)}
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('walk')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F95738] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Walk</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. WIDGET CARD MATCHING REF-03 (life-tracker-v2-03-walk-widget.jpg)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Header row: Icon circle + "Walk" + "Days" + timestamp */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-[#F95738]">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white leading-tight">Walk</div>
              <div className="text-xs text-zinc-400 flex items-center gap-1">
                <span>🔥</span>
                <span>{walks.length} {walks.length === 1 ? 'session' : 'sessions'}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            {formatDateLabel(activeDate)}
          </span>
        </div>

        {/* Ref-03: Striped coral progress bar */}
        <div className="relative w-full h-7 bg-zinc-900 rounded-xl overflow-hidden p-1 border border-white/[0.04] my-4">
          <div
            className="h-full rounded-lg bg-[#F95738] walk-striped-bar transition-all duration-700 relative"
            style={{ width: `${Math.max(8, Math.min((totalWalkSteps / 6000) * 100, 100))}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-r-lg" />
          </div>
        </div>

        {/* Big Step Number + Sparkline Row (Ref-03 style) */}
        <div className="flex items-center justify-between mt-5 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              {totalWalkSteps.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-zinc-400 uppercase">Steps</span>
          </div>

          <div className="flex items-center gap-2 text-right">
            {/* SVG Sparkline Curve */}
            <svg className="w-16 h-8 text-[#F95738]" viewBox="0 0 60 25" fill="none">
              <path
                d="M 2 15 Q 15 5, 25 18 T 45 10 T 58 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>94</span>
              </div>
              <span className="text-[10px] text-zinc-400">BPM</span>
            </div>
          </div>
        </div>

        {/* Stat Capsule (Ref-03 style: 3 columns: km / min / kcal) */}
        <div className="mt-5 p-3 rounded-2xl bg-zinc-900/70 border border-white/[0.05] grid grid-cols-3 divide-x divide-white/[0.06] text-center">
          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-400">
              <MapPin className="w-3 h-3 text-[#F95738]" />
              <span>Distance</span>
            </div>
            <div className="text-base font-black text-white mt-0.5">
              {totalWalkKm.toFixed(2)} <span className="text-xs font-normal text-zinc-400">km</span>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-400">
              <Clock className="w-3 h-3 text-zinc-300" />
              <span>Duration</span>
            </div>
            <div className="text-base font-black text-white mt-0.5">
              {totalWalkMin} <span className="text-xs font-normal text-zinc-400">min</span>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-400">
              <Flame className="w-3 h-3 text-[#F95738]" />
              <span>Burned</span>
            </div>
            <div className="text-base font-black text-white mt-0.5">
              {totalWalkKcal} <span className="text-xs font-normal text-zinc-400">kcal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SESSIONS LIST OR EMPTY STATE (No image, plain Lucide icon + one line text per brief)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Walk Sessions
        </h4>

        {walks.length === 0 ? (
          /* Empty State: Plain Lucide icon + one line of text per Rule 6 */
          <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
              <Footprints className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-300 mb-4">No walks logged today</p>
            <button
              onClick={() => onOpenQuickLog('walk')}
              className="py-2.5 px-4 rounded-xl bg-[#F95738] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Walk</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {walks.map((w) => (
              <div
                key={w.id}
                className="bg-[#121214] border border-white/[0.06] rounded-2xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-[#F95738]">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{w.title}</h5>
                      <span className="text-xs text-zinc-400">{w.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteWalk(w.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete walk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Session metrics */}
                <div className="mt-3 grid grid-cols-4 gap-2 text-center bg-zinc-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Steps</div>
                    <div className="text-sm font-bold text-white mt-0.5">{w.steps.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Distance</div>
                    <div className="text-sm font-bold text-white mt-0.5">{w.distanceKm} km</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Time</div>
                    <div className="text-sm font-bold text-white mt-0.5">{w.durationMin}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Burn</div>
                    <div className="text-sm font-bold text-[#F95738] mt-0.5">{w.calories} kcal</div>
                  </div>
                </div>

                {w.notes && (
                  <p className="mt-2 text-xs text-zinc-400 italic">
                    "{w.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
