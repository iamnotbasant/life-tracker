'use client';

import React, { useState } from 'react';
import { X, Footprints, Utensils, Dumbbell, Scale } from 'lucide-react';
import { MealEntry, MealType, WorkoutEntry, UserProfile } from '../lib/types';
import { estimateStepsCalories } from '../lib/points';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDate: string;
  profile: UserProfile;
  currentSteps: number;
  onSaveSteps: (steps: number, note?: string) => void;
  onAddMeal: (meal: MealEntry) => void;
  onAddWorkout: (workout: WorkoutEntry) => void;
  onLogWeight: (weight: number, note?: string) => void;
  defaultTab?: 'steps' | 'meal' | 'workout' | 'weight';
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  activeDate,
  profile,
  currentSteps,
  onSaveSteps,
  onAddMeal,
  onAddWorkout,
  onLogWeight,
  defaultTab = 'steps',
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'meal' | 'workout' | 'weight'>(defaultTab);

  // Steps state
  const [stepInput, setStepInput] = useState<number>(currentSteps || 0);
  const [stepsNote, setStepsNote] = useState('');

  // Meal state
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealDesc, setMealDesc] = useState('');
  const [mealKcal, setMealKcal] = useState<string>('500');
  const [mealProtein, setMealProtein] = useState<string>('25');
  const [mealTime, setMealTime] = useState('13:00');

  // Workout state
  const [woName, setWoName] = useState('Calisthenics Session');
  const [woType, setWoType] = useState<'calisthenics' | 'cardio' | 'mobility' | 'strength' | 'other'>('calisthenics');
  const [woDur, setWoDur] = useState('45');
  const [woKcal, setWoKcal] = useState('220');
  const [woExercises, setWoExercises] = useState('Parallel Bar Dips 4x10\nPush-ups 4x15\nPull-ups 3x8');

  // Weight state
  const [weightInput, setWeightInput] = useState<string>(String(profile.weightKg || '48.9'));
  const [weightNote, setWeightNote] = useState('');

  if (!isOpen) return null;

  // Handlers
  const handleSaveSteps = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSteps(Number(stepInput) || 0, stepsNote);
    onClose();
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDesc) return;
    const newMeal: MealEntry = {
      id: `m-${Date.now()}`,
      mealType,
      description: mealDesc,
      calories: Number(mealKcal) || 0,
      protein: Number(mealProtein) || 0,
      time: mealTime,
    };
    onAddMeal(newMeal);
    onClose();
  };


  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const exLines = woExercises
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => ({ name: line }));

    const newWo: WorkoutEntry = {
      id: `wo-${Date.now()}`,
      name: woName || 'Calisthenics Workout',
      type: woType,
      durationMin: Number(woDur) || 30,
      calories: Number(woKcal) || 200,
      time: '18:00',
      exercises: exLines,
    };
    onAddWorkout(newWo);
    onClose();
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(weightInput);
    if (val > 0) {
      onLogWeight(val, weightNote);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#121815] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#18201C]/60">
          <h3 className="text-base font-bold text-white tracking-tight">Quick Log</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 bg-[#0A0F0D] border-b border-white/[0.06] gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'steps', label: 'Steps', icon: Footprints },
            { id: 'meal', label: 'Meal', icon: Utensils },
            { id: 'workout', label: 'Workout', icon: Dumbbell },
            { id: 'weight', label: 'Weight', icon: Scale },
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-[#22C55E] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {/* TAB 1: STEPS */}
          {activeTab === 'steps' && (
            <form onSubmit={handleSaveSteps} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Total Steps for {activeDate}
                </label>
                <input
                  type="number"
                  value={stepInput}
                  onChange={e => setStepInput(Number(e.target.value))}
                  placeholder="e.g. 10000"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-4 py-3 text-3xl font-black text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              {/* Quick increment pills */}
              <div className="flex gap-2">
                {[500, 1000, 2500, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStepInput(prev => (prev || 0) + amt)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-[#18201C] hover:bg-zinc-800 border border-white/[0.06] text-xs font-semibold text-zinc-300 active:scale-95 transition-all"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              {/* Calorie estimate preview */}
              <div className="p-3 rounded-xl bg-[#18201C]/60 border border-white/[0.04] text-xs text-zinc-400 flex items-center justify-between">
                <span>Burn estimate (@ {profile.weightKg} kg):</span>
                <span className="font-bold text-[#22C55E]">
                  ~{estimateStepsCalories(stepInput, profile.stepCalorieFactor)} kcal
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={stepsNote}
                  onChange={e => setStepsNote(e.target.value)}
                  placeholder="e.g. Evening steps around campus"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all"
              >
                Save Steps
              </button>
            </form>
          )}

          {/* TAB 2: MEAL */}
          {activeTab === 'meal' && (
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMealType(t)}
                    className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                      mealType === t
                        ? 'bg-[#22C55E] border-[#22C55E] text-black'
                        : 'bg-[#18201C] border-white/[0.06] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Food Description
                </label>
                <input
                  type="text"
                  required
                  value={mealDesc}
                  onChange={e => setMealDesc(e.target.value)}
                  placeholder="e.g. 4 roti + dal + paneer bhurji"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    value={mealKcal}
                    onChange={e => setMealKcal(e.target.value)}
                    className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={mealProtein}
                    onChange={e => setMealProtein(e.target.value)}
                    className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={mealTime}
                  onChange={e => setMealTime(e.target.value)}
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all"
              >
                Log Meal
              </button>
            </form>
          )}


          {/* TAB 4: WORKOUT */}
          {activeTab === 'workout' && (
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={woName}
                  onChange={e => setWoName(e.target.value)}
                  placeholder="e.g. Calisthenics Dips & Pull-ups"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={woDur}
                    onChange={e => setWoDur(e.target.value)}
                    className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    value={woKcal}
                    onChange={e => setWoKcal(e.target.value)}
                    className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Exercises / Sets
                </label>
                <textarea
                  rows={3}
                  value={woExercises}
                  onChange={e => setWoExercises(e.target.value)}
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all"
              >
                Log Workout (+10 Pts)
              </button>
            </form>
          )}

          {/* TAB 5: WEIGHT */}
          {activeTab === 'weight' && (
            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Body Weight (kg)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-4 py-3 text-3xl font-black text-white focus:outline-none focus:border-[#22C55E]"
                  />
                  <span className="text-xl font-bold text-zinc-500">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Context / Note
                </label>
                <input
                  type="text"
                  value={weightNote}
                  onChange={e => setWeightNote(e.target.value)}
                  placeholder="e.g. Morning empty stomach"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all"
              >
                Save Weight (+5 Pts)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
