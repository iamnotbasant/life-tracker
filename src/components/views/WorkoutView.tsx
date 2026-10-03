'use client';

import React from 'react';
import { Dumbbell, Plus, Trash2, SlidersHorizontal, Scale } from 'lucide-react';
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
  const { profile, activeDate, days } = state;
  const currentDay = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  const workouts = currentDay.workouts || [];
  const todayMinutes = workouts.reduce((sum, w) => sum + (w.durationMin || 0), 0);
  const todayCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

  // Quick preset logger for Calisthenics
  const handleLogPreset = (name: string, type: any, dur: number, cal: number, exercises: string[]) => {
    const newWo: WorkoutEntry = {
      id: `wo-${Date.now()}`,
      name,
      type,
      durationMin: dur,
      calories: cal,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      exercises: exercises.map(ex => ({ name: ex })),
      notes: 'Calisthenics routine logged',
    };
    onAddWorkout(newWo);
  };

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER: EXACTLY LIKE v3-01
          Title top-left "Workouts" + 2 circular icon buttons top-right
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Workouts</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{formatDateLabel(activeDate)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickLog('workout')}
            className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
            title="Filter Workouts"
            aria-label="Filter Workouts"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenQuickLog('workout')}
            className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
            title="Add Workout"
            aria-label="Add Workout"
          >
            <Plus className="w-5 h-5 text-[#22C55E]" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Full-width card (Matching v3-01 "Weight" top card)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Weight</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Logged 1 min ago</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-white tracking-tight">
            {profile.weightKg} <span className="text-sm font-medium text-zinc-500">kg</span>
          </div>
          <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 2: 2-column grid of two cards (Matching v3-01 middle row)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Card: Sessions count */}
        <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="text-4xl font-black text-white tracking-tight">
              {workouts.length}
            </span>
            <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Number</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Logged just now</div>
          </div>
        </div>

        {/* Right Card: Duration */}
        <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="text-4xl font-black text-white tracking-tight">
              {todayMinutes} <span className="text-sm font-medium text-zinc-500">min</span>
            </span>
            <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Measurement</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Logged 1 min ago</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Full-width card (Matching v3-01 "Percentage" card)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Energy Burn</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Logged just now</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-[#22C55E] tracking-tight">
            {todayCalories} <span className="text-sm font-medium text-zinc-500">kcal</span>
          </div>
          <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 4: Full-width card (Matching v3-01 "Cardio 365" card)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Cardio 365</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">15+ min unlocks +10 pts</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-black text-[#22C55E]">
            {workouts.length > 0 ? workouts.length : 1}
          </div>
          <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 5: Calisthenics Routines & Logged Sessions
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() =>
            handleLogPreset(
              'Push & Dips Focus',
              'calisthenics',
              45,
              220,
              ['Parallel Bar Dips: 4x10', 'Push-ups: 4x15', 'Pike Push-ups: 3x8']
            )
          }
          className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Push & Dips</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <span className="text-[10px] text-zinc-500 font-medium">45 min • 220 kcal</span>
        </button>

        <button
          onClick={() =>
            handleLogPreset(
              'Pull-ups & Core',
              'calisthenics',
              40,
              200,
              ['Pull-ups: 4x6', 'Chin-ups: 3x8', 'Hanging Leg Raises: 4x12']
            )
          }
          className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Pull-ups & Core</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <span className="text-[10px] text-zinc-500 font-medium">40 min • 200 kcal</span>
        </button>
      </div>

      {/* Logged Workouts List */}
      <div className="space-y-2.5 pt-1">
        <div className="text-xs font-semibold text-zinc-400 px-1">
          Logged Sessions
        </div>

        {workouts.length === 0 ? (
          /* Empty state: one Lucide icon + one line text */
          <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-8 text-center flex flex-col items-center">
            <Dumbbell className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No workouts logged today</p>
          </div>
        ) : (
          workouts.map((w) => (
            <div
              key={w.id}
              className="bg-[#121815] border border-white/[0.05] rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{w.name}</h4>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {w.durationMin}m • <span className="text-[#22C55E]">{w.calories} kcal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-lg">
                    +10 pts
                  </span>
                  <button
                    onClick={() => onDeleteWorkout(w.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete workout"
                    aria-label="Delete workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {w.exercises && w.exercises.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1">
                  {w.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="text-xs py-1 px-2.5 rounded-lg bg-[#18201C] text-zinc-300"
                    >
                      {ex.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
