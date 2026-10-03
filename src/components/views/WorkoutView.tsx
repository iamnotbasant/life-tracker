'use client';

import React from 'react';
import { Dumbbell, Plus, Trash2, Zap, SlidersHorizontal } from 'lucide-react';
import { AppState, WorkoutEntry } from '../../lib/types';
import { formatDateLabel } from '../../lib/utils';

interface WorkoutViewProps {
  state: AppState;
  onAddWorkout: (workout: WorkoutEntry) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onOpenQuickLog: (tab: 'workout') => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  state,
  onAddWorkout,
  onDeleteWorkout,
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

  const workouts = currentDay.workouts || [];

  // Stat computations
  const todayMinutes = workouts.reduce((sum, w) => sum + (w.durationMin || 0), 0);
  const todayCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

  let totalWorkoutsCount = 0;
  for (const d of Object.values(days)) {
    if (d.workouts) {
      totalWorkoutsCount += d.workouts.length;
    }
  }

  // Quick preset logger for Calisthenics
  const handleLogPreset = (name: string, type: any, dur: number, cal: number, exercises: string[]) => {
    const newWo: WorkoutEntry = {
      id: `wo-preset-${Date.now()}`,
      name,
      type,
      durationMin: dur,
      calories: cal,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      exercises: exercises.map(ex => ({ name: ex })),
      notes: 'Logged via quick calisthenics routine',
    };
    onAddWorkout(newWo);
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Header exactly like Ref-01 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Workouts</h2>
          <p className="text-xs text-zinc-400">{formatDateLabel(activeDate)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickLog('workout')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
            title="Filter or Log"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenQuickLog('workout')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
            title="Add Workout"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. STAT CARDS EXACTLY MATCHING REF-01 (life-tracker-v2-01-workout-cards.jpg)
          Dark, few large cards per screen, big numerals, tiny captions
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Large Card 1: Today's Workouts / Weight-like wide card */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-white">Workouts</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {workouts.length > 0 ? `Logged ${workouts.length} session today` : 'Logged just now'}
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white">{workouts.length}</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase">today</span>
          </div>
        </div>

        {/* 2 Medium Side-by-Side Cards (matching Ref-01 middle row) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 2: Training Minutes */}
          <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{todayMinutes}</span>
              <span className="text-xs font-semibold text-zinc-500">min</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Duration</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Active training time</div>
            </div>
          </div>

          {/* Card 3: Calories Burned */}
          <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#F95738]">{todayCalories}</span>
              <span className="text-xs font-semibold text-zinc-500">kcal</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Energy Burn</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Metabolic demand</div>
            </div>
          </div>
        </div>

        {/* Wide Card 4: Points Rule Indicator (matching Ref-01 cardio 365 card) */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-white">Daily Discipline Rule</div>
            <div className="text-xs text-zinc-500 mt-0.5">15+ min session unlocks points</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#FACC15]">+10</span>
            <span className="text-xs font-bold text-zinc-400">PTS</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK PRESET CALISTHENICS SHORTCUTS
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Calisthenics Routines</span>
          </h4>
          <span className="text-[10px] text-zinc-500">Tap to log</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() =>
              handleLogPreset(
                'Push & Dips Focus',
                'calisthenics',
                45,
                220,
                ['Parallel Bar Dips: 4x10', 'Push-ups: 4x15', 'Pike Push-ups: 3x8', 'Plank: 3x60s']
              )
            }
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-[#FACC15] transition-colors">
              Push & Dips Focus
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">45 min • 220 kcal • Dips</div>
          </button>

          <button
            onClick={() =>
              handleLogPreset(
                'Pull-ups & Core Strength',
                'calisthenics',
                40,
                200,
                ['Pull-ups (Overhand): 4x6', 'Chin-ups: 3x8', 'Hanging Leg Raises: 4x12', 'Hollow Body: 3x45s']
              )
            }
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-[#FACC15] transition-colors">
              Pull-ups & Core
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">40 min • 200 kcal • Pull-ups</div>
          </button>

          <button
            onClick={() =>
              handleLogPreset(
                'Handstand & Mobility',
                'calisthenics',
                30,
                140,
                ['Wall Handstand Holds: 5x30s', 'Wrist Mobility: 3 sets', 'Deep Squats: 3x20']
              )
            }
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-[#FACC15] transition-colors">
              Handstand & Mobility
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">30 min • 140 kcal • Holds</div>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TODAY'S WORKOUTS OR EMPTY STATE (No image, plain Lucide icon per brief)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Logged Sessions
        </h4>

        {workouts.length === 0 ? (
          /* Empty state: plain Lucide icon + one line text per Rule 6 */
          <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
              <Dumbbell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-300 mb-4">No workouts recorded today</p>
            <button
              onClick={() => onOpenQuickLog('workout')}
              className="py-2.5 px-4 rounded-xl bg-[#F95738] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Training Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="bg-[#121214] border border-white/[0.06] rounded-2xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-[#F95738]">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{w.name}</h5>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="capitalize text-zinc-300">{w.type}</span>
                        <span>•</span>
                        <span>{w.durationMin} mins</span>
                        <span>•</span>
                        <span className="text-[#F95738]">{w.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-lg border border-[#FACC15]/20">
                      +10 Pts
                    </span>
                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises list */}
                {w.exercises && w.exercises.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1">
                    {w.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="text-xs py-1 px-2.5 rounded-lg bg-zinc-900/60 text-zinc-300 flex justify-between"
                      >
                        <span>{ex.name}</span>
                        {ex.sets && ex.reps && (
                          <span className="text-zinc-500 font-mono text-[11px]">
                            {ex.sets}s × {ex.reps}r
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
