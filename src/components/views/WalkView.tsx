'use client';

import React from 'react';
import { Footprints, Plus, Trash2 } from 'lucide-react';
import { AppState, WalkSession } from '../../lib/types';
import { formatDateLabel } from '../../lib/utils';

interface WalkViewProps {
  state: AppState;
  onAddWalk: (walk: WalkSession) => void;
  onDeleteWalk: (walkId: string) => void;
  onOpenQuickLog: (tab: 'walk') => void;
  onSelectTab?: (tab: any) => void;
}

export const WalkView: React.FC<WalkViewProps> = ({
  state,
  onDeleteWalk,
  onOpenQuickLog,
  onSelectTab,
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
            <h1 className="text-3xl font-black text-white tracking-tight">Walk</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{formatDateLabel(activeDate)}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenQuickLog('walk')}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="New Walk"
          aria-label="New Walk"
        >
          <Plus className="w-5 h-5 text-[#22C55E]" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Widget Card (total km big, 3 sub-stats)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-semibold text-zinc-400">Total Walk Distance</div>
        <div className="text-5xl font-black text-white tracking-tight my-2">
          {totalWalkKm.toFixed(2)} <span className="text-2xl font-normal text-zinc-500">km</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mb-4">
          {walks.length} session{walks.length === 1 ? '' : 's'} recorded today
        </div>

        {/* 3 Sub-stats (steps, duration, kcal) */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.04]">
          <div className="bg-[#18201C] p-3 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">Steps</div>
            <div className="text-base font-black text-white mt-0.5">{totalWalkSteps.toLocaleString()}</div>
          </div>
          <div className="bg-[#18201C] p-3 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">Duration</div>
            <div className="text-base font-black text-white mt-0.5">{totalWalkMin}m</div>
          </div>
          <div className="bg-[#18201C] p-3 rounded-xl text-center border border-white/[0.02]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500">Burned</div>
            <div className="text-base font-black text-[#22C55E] mt-0.5">{totalWalkKcal} kcal</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Session List Cards (or Empty State)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-zinc-400 px-1 pt-1">
          Sessions
        </div>

        {walks.length === 0 ? (
          /* Empty State: one Lucide icon + one line of text per brief */
          <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-8 text-center flex flex-col items-center">
            <Footprints className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No walks logged today</p>
          </div>
        ) : (
          walks.map((w) => (
            <div
              key={w.id}
              className="bg-[#121815] border border-white/[0.05] rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{w.title}</h4>
                  <span className="text-[11px] text-zinc-500">{w.time}</span>
                </div>
                <button
                  onClick={() => onDeleteWalk(w.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete walk"
                  aria-label="Delete walk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Session sub-stats */}
              <div className="mt-3 grid grid-cols-4 gap-2 text-center bg-[#18201C] p-2.5 rounded-xl border border-white/[0.02]">
                <div>
                  <div className="text-[10px] uppercase font-medium text-zinc-500">Dist</div>
                  <div className="text-xs font-bold text-white mt-0.5">{w.distanceKm} km</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-medium text-zinc-500">Steps</div>
                  <div className="text-xs font-bold text-white mt-0.5">{w.steps.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-medium text-zinc-500">Time</div>
                  <div className="text-xs font-bold text-white mt-0.5">{w.durationMin}m</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-medium text-zinc-500">Burn</div>
                  <div className="text-xs font-bold text-[#22C55E] mt-0.5">{w.calories} kcal</div>
                </div>
              </div>

              {w.notes && (
                <p className="mt-2 text-xs text-zinc-400 italic">
                  "{w.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
