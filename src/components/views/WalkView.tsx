'use client';

import React from 'react';
import Image from 'next/image';
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
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
            Walking Sessions
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            {formatDateLabel(activeDate)}
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('walk')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white font-bold text-xs shadow-lg shadow-[#F97316]/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Walk</span>
        </button>
      </div>

      {/* Aggregate Widget Card for Today */}
      <section className="bg-gradient-to-br from-[#1E120A] via-[#161224] to-[#0D101C] border border-[#F97316]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#F97316]/20 text-[#F97316]">
              <Footprints className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">Daily Walk Summary</span>
          </div>
          <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-2.5 py-1 rounded-full border border-[#F97316]/20">
            {walks.length} {walks.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        {/* Ref-07 Style: Striped orange progress bar */}
        <div className="relative w-full h-8 bg-[#181D2C] rounded-2xl overflow-hidden p-1 border border-white/[0.06]">
          <div
            className="h-full rounded-xl bg-[#F97316] walk-striped-bar transition-all duration-700 relative"
            style={{ width: `${Math.min((totalWalkSteps / 6000) * 100, 100)}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/40 rounded-r-xl" />
          </div>
        </div>

        {/* Big Step Number + Sparkline Row (ref-07 style) */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {totalWalkSteps.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase">Walk Steps</span>
          </div>

          <div className="flex items-center gap-2 text-right">
            {/* SVG Sparkline Curve */}
            <svg className="w-16 h-8 text-[#F97316]" viewBox="0 0 60 25" fill="none">
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
              <span className="text-[10px] text-slate-400">AVG BPM</span>
            </div>
          </div>
        </div>

        {/* Stat Capsule (ref-07 style: km / min / kcal) */}
        <div className="mt-5 p-3 rounded-2xl bg-[#0F1422] border border-white/[0.08] grid grid-cols-3 divide-x divide-white/[0.08] text-center">
          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
              <MapPin className="w-3 h-3 text-[#F97316]" />
              <span>Distance</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {totalWalkKm.toFixed(2)} <span className="text-xs font-medium text-slate-400">km</span>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
              <Clock className="w-3 h-3 text-[#38BDF8]" />
              <span>Duration</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {totalWalkMin} <span className="text-xs font-medium text-slate-400">min</span>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
              <Flame className="w-3 h-3 text-[#FF5E1E]" />
              <span>Burned</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {totalWalkKcal} <span className="text-xs font-medium text-slate-400">kcal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions List or Empty State */}
      <section className="space-y-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Walk Sessions
        </h4>

        {walks.length === 0 ? (
          /* Empty State matching requirements: wire in empty-walks.png */
          <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="relative w-40 h-40 mb-3 opacity-90">
              <Image
                src="/assets/empty-walks.png"
                alt="No walks logged"
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
            <h5 className="text-base font-bold text-white">No walks logged today</h5>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              Step outside for a brisk fresh-air campus walk. Even a 20-minute stroll burns clean calories and boosts metabolism!
            </p>
            <button
              onClick={() => onOpenQuickLog('walk')}
              className="py-2.5 px-5 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Walk</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {walks.map((w) => (
              <div
                key={w.id}
                className="bg-[#111726] border border-white/[0.08] hover:border-[#F97316]/40 rounded-3xl p-5 shadow-lg relative overflow-hidden transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#F97316]/15 text-[#F97316]">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-white">{w.title}</h5>
                      <span className="text-xs text-slate-400">{w.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteWalk(w.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete walk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Session metrics */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center bg-[#0C1220] p-3 rounded-2xl border border-white/[0.05]">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Steps</div>
                    <div className="text-sm font-black text-white mt-0.5">{w.steps.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Distance</div>
                    <div className="text-sm font-black text-white mt-0.5">{w.distanceKm} km</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Time</div>
                    <div className="text-sm font-black text-white mt-0.5">{w.durationMin}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Burn</div>
                    <div className="text-sm font-black text-[#F97316] mt-0.5">{w.calories} kcal</div>
                  </div>
                </div>

                {w.notes && (
                  <p className="mt-3 text-xs text-slate-300 italic bg-white/[0.03] px-3 py-1.5 rounded-xl">
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
