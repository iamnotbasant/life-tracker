'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dumbbell, Plus, Flame, Clock, Trash2, CheckCircle, Zap } from 'lucide-react';
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

  // Stat computations across all history for ref-05 stat tiles
  let totalWorkoutsCount = 0;
  let totalWorkoutMinutes = 0;
  let totalWorkoutCalories = 0;

  for (const d of Object.values(days)) {
    if (d.workouts) {
      totalWorkoutsCount += d.workouts.length;
      for (const w of d.workouts) {
        totalWorkoutMinutes += w.durationMin || 0;
        totalWorkoutCalories += w.calories || 0;
      }
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
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-wider">
            Calisthenics & Training
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            {formatDateLabel(activeDate)}
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('workout')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#06B6D4] to-[#38BDF8] text-white font-bold text-xs shadow-lg shadow-[#06B6D4]/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Custom Workout</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. STAT TILES LIKE REF-05 (Workout Stat Cards)
          Big bold numerals, dark OLED cards, subtitle labels
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stat 1: Total Workouts */}
        <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-4 shadow-md">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {totalWorkoutsCount}
          </div>
          <div className="text-xs font-bold text-white mt-1">Total Workouts</div>
          <div className="text-[10px] text-slate-400 mt-0.5">All-time calisthenics</div>
        </div>

        {/* Stat 2: Total Minutes */}
        <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-4 shadow-md">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {totalWorkoutMinutes} <span className="text-sm font-semibold text-slate-400">min</span>
          </div>
          <div className="text-xs font-bold text-white mt-1">Training Time</div>
          <div className="text-[10px] text-slate-400 mt-0.5">High muscle activation</div>
        </div>

        {/* Stat 3: Total Calories */}
        <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-4 shadow-md">
          <div className="text-3xl sm:text-4xl font-black text-[#06B6D4] tracking-tight">
            {totalWorkoutCalories}
          </div>
          <div className="text-xs font-bold text-white mt-1">Kcal Burned</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Metabolic demand</div>
        </div>

        {/* Stat 4: Points Rule Indicator */}
        <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-4 shadow-md">
          <div className="text-3xl sm:text-4xl font-black text-[#FFA114] tracking-tight">
            +10 <span className="text-sm font-semibold text-slate-400">pts</span>
          </div>
          <div className="text-xs font-bold text-white mt-1">Rule Value</div>
          <div className="text-[10px] text-slate-400 mt-0.5">For 15+ min session</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK PRESET CALISTHENICS SHORTCUTS
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#101728] border border-white/[0.08] rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Basant's Calisthenics Presets</span>
          </h4>
          <span className="text-[10px] text-slate-400">Tap to log</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() =>
              handleLogPreset(
                'Calisthenics Push & Dips',
                'calisthenics',
                45,
                220,
                ['Parallel Bar Dips: 4x10', 'Push-ups: 4x15', 'Pike Push-ups: 3x8', 'Plank: 3x60s']
              )
            }
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#152138] border border-white/[0.06] hover:border-[#06B6D4]/40 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-[#06B6D4] transition-colors">
              Push & Dips Focus
            </div>
            <div className="text-[10px] text-slate-400 mt-1">45 min • ~220 kcal • Dips/Push-ups</div>
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
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#152138] border border-white/[0.06] hover:border-[#06B6D4]/40 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-[#06B6D4] transition-colors">
              Pull-ups & Core
            </div>
            <div className="text-[10px] text-slate-400 mt-1">40 min • ~200 kcal • Pull-ups/Hanging Leg</div>
          </button>

          <button
            onClick={() =>
              handleLogPreset(
                'Handstand & Mobility Drill',
                'calisthenics',
                30,
                140,
                ['Wall Handstand Holds: 5x30s', 'Wrist Mobility & Push-up Holds: 3 sets', 'Deep Squats & Calf Raises: 3x20']
              )
            }
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#152138] border border-white/[0.06] hover:border-[#06B6D4]/40 text-left transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-[#06B6D4] transition-colors">
              Handstand & Mobility
            </div>
            <div className="text-[10px] text-slate-400 mt-1">30 min • ~140 kcal • Handstand Holds/Wrists</div>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TODAY'S WORKOUTS OR EMPTY STATE
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Today's Logged Sessions
        </h4>

        {workouts.length === 0 ? (
          /* Empty state wiring in empty-workouts.png */
          <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="relative w-40 h-40 mb-3 opacity-90">
              <Image
                src="/assets/empty-workouts.png"
                alt="No workouts logged"
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
            <h5 className="text-base font-bold text-white">No workouts recorded today</h5>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              A 15-minute calisthenics routine locks in +10 daily points and stimulates muscle hypertrophy for your 48.9 kg gain goal.
            </p>
            <button
              onClick={() => onOpenQuickLog('workout')}
              className="py-2.5 px-5 rounded-2xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs shadow-md shadow-[#06B6D4]/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Training Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="bg-[#111726] border border-white/[0.08] hover:border-[#06B6D4]/40 rounded-3xl p-5 shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#06B6D4]/20 text-[#06B6D4]">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-white">{w.name}</h5>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="capitalize text-[#38BDF8] font-semibold">{w.type}</span>
                        <span>•</span>
                        <span>⏱️ {w.durationMin} mins</span>
                        <span>•</span>
                        <span className="text-white font-semibold">🔥 {w.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#06B6D4] bg-[#06B6D4]/15 px-2.5 py-1 rounded-xl">
                      +10 Pts
                    </span>
                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises Breakdown */}
                {w.exercises && w.exercises.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Exercises & Sets
                    </div>
                    {w.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#0B101D] border border-white/[0.04]"
                      >
                        <span className="text-slate-200 font-medium">{ex.name}</span>
                        {ex.sets && ex.reps && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {ex.sets} sets × {ex.reps} reps
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {w.notes && (
                  <p className="mt-3 text-xs text-slate-300 italic bg-white/[0.02] px-3 py-1.5 rounded-xl">
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
