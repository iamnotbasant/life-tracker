'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Footprints,
  Utensils,
  Dumbbell,
  Scale,
  Moon,
  Sparkles,
  Loader2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { MealEntry, MealType, WorkoutEntry, UserProfile, SleepData } from '../lib/types';
import { estimateStepsCalories } from '../lib/points';
import { calculateSleepHours, formatTime12h, cn } from '../lib/utils';
import { getGeminiApiKey, estimateMealNutrition, estimateWorkoutCalories } from '../lib/gemini';

export type QuickLogTab = 'meal' | 'workout' | 'sleep' | 'weight' | 'steps';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDate: string;
  profile: UserProfile;
  currentSteps: number;
  currentSleep?: SleepData;
  onSaveSteps: (steps: number, note?: string) => void;
  onAddMeal: (meal: MealEntry) => void;
  onAddWorkout: (workout: WorkoutEntry) => void;
  onLogWeight: (weight: number, note?: string) => void;
  onSaveSleep?: (sleep: SleepData) => void;
  defaultTab?: QuickLogTab;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  activeDate,
  profile,
  currentSteps,
  currentSleep,
  onSaveSteps,
  onAddMeal,
  onAddWorkout,
  onLogWeight,
  onSaveSleep,
  defaultTab = 'meal',
}) => {
  const [activeTab, setActiveTab] = useState<QuickLogTab>(defaultTab);

  // Sync tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Steps state
  const [stepInput, setStepInput] = useState<number>(currentSteps || 0);
  const [stepsNote, setStepsNote] = useState('');

  // Meal state
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealDesc, setMealDesc] = useState('');
  const [mealKcal, setMealKcal] = useState<string>('500');
  const [mealProtein, setMealProtein] = useState<string>('25');
  const [mealTime, setMealTime] = useState('13:00');
  const [isMealAiEstimating, setIsMealAiEstimating] = useState(false);
  const [mealAiNotice, setMealAiNotice] = useState<{
    type: 'missing_key' | 'error' | 'success';
    message: string;
  } | null>(null);

  // Workout state
  const [woName, setWoName] = useState('Calisthenics Session');
  const [woType, setWoType] = useState<'calisthenics' | 'cardio' | 'mobility' | 'strength' | 'other'>('calisthenics');
  const [woDur, setWoDur] = useState('45');
  const [woKcal, setWoKcal] = useState('220');
  const [woExercises, setWoExercises] = useState('Parallel Bar Dips 4x10\nPush-ups 4x15\nPull-ups 3x8');
  const [isWorkoutAiEstimating, setIsWorkoutAiEstimating] = useState(false);
  const [workoutAiNotice, setWorkoutAiNotice] = useState<{
    type: 'missing_key' | 'error' | 'success';
    message: string;
  } | null>(null);

  // Sleep state
  const [sleepStart, setSleepStart] = useState(currentSleep?.sleepStart || '01:00');
  const [sleepEnd, setSleepEnd] = useState(currentSleep?.sleepEnd || '08:00');

  // Weight state
  const [weightInput, setWeightInput] = useState<string>(String(profile.weightKg || '48.9'));
  const [weightNote, setWeightNote] = useState('');

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handlers
  const handleSaveSteps = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSteps(Number(stepInput) || 0, stepsNote);
    onClose();
  };

  const handleMealAiEstimate = async () => {
    setMealAiNotice(null);
    if (!mealDesc.trim()) {
      setMealAiNotice({
        type: 'error',
        message: 'Please enter a food description first.',
      });
      return;
    }

    const key = getGeminiApiKey();
    if (!key) {
      setMealAiNotice({
        type: 'missing_key',
        message: 'Add your Gemini API key in Settings — free from Google AI Studio (aistudio.google.com)',
      });
      return;
    }

    setIsMealAiEstimating(true);
    try {
      const est = await estimateMealNutrition(mealDesc, key);
      setMealKcal(String(est.calories));
      setMealProtein(String(est.protein));
      setMealAiNotice({
        type: 'success',
        message: `Estimated: ${est.calories} kcal · ${est.protein}g protein`,
      });
    } catch (err: any) {
      setMealAiNotice({
        type: 'error',
        message: err?.message || 'Failed to estimate nutrition. Please check your API key.',
      });
    } finally {
      setIsMealAiEstimating(false);
    }
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

  const handleWorkoutAiEstimate = async () => {
    setWorkoutAiNotice(null);
    const query = woName.trim() + (woExercises.trim() ? ` with ${woExercises.trim().replace(/\n/g, ', ')}` : '');
    if (!query) {
      setWorkoutAiNotice({
        type: 'error',
        message: 'Please enter workout details first.',
      });
      return;
    }

    const key = getGeminiApiKey();
    if (!key) {
      setWorkoutAiNotice({
        type: 'missing_key',
        message: 'Add your Gemini API key in Settings — free from Google AI Studio (aistudio.google.com)',
      });
      return;
    }

    setIsWorkoutAiEstimating(true);
    try {
      const dur = Number(woDur) || undefined;
      const est = await estimateWorkoutCalories(query, dur, key);
      setWoKcal(String(est.calories));
      setWorkoutAiNotice({
        type: 'success',
        message: `Estimated: ${est.calories} kcal burned`,
      });
    } catch (err: any) {
      setWorkoutAiNotice({
        type: 'error',
        message: err?.message || 'Failed to estimate burn. Please check your API key.',
      });
    } finally {
      setIsWorkoutAiEstimating(false);
    }
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

  const sleepDurationHours = sleepStart && sleepEnd ? calculateSleepHours(sleepStart, sleepEnd) : null;
  const isSleepBedtimeGood = () => {
    if (!sleepStart) return false;
    const [h, m] = sleepStart.split(':').map(Number);
    return h >= 20 && (h < 23 || (h === 23 && m <= 30));
  };
  const isSleepDurationGood = () => {
    if (sleepDurationHours === null) return false;
    return sleepDurationHours >= 7 && sleepDurationHours <= 8.5;
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepStart || !sleepEnd) return;
    const hours = calculateSleepHours(sleepStart, sleepEnd);
    if (onSaveSleep) {
      onSaveSleep({
        sleepStart,
        sleepEnd,
        sleepHours: hours,
      });
    }
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
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Quick Log</h3>
            <p className="text-[11px] text-zinc-400 font-medium">{activeDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - Covers all five: Meal, Workout, Sleep, Weight, Steps */}
        <div className="flex p-2 bg-[#0A0F0D] border-b border-white/[0.06] gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'meal', label: 'Meal', icon: Utensils },
            { id: 'workout', label: 'Workout', icon: Dumbbell },
            { id: 'sleep', label: 'Sleep', icon: Moon },
            { id: 'weight', label: 'Weight', icon: Scale },
            { id: 'steps', label: 'Steps', icon: Footprints },
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as QuickLogTab)}
                className={`flex-1 min-w-[55px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-[#22C55E] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {/* TAB: MEAL */}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Food Description
                  </label>
                  <button
                    type="button"
                    onClick={handleMealAiEstimate}
                    disabled={isMealAiEstimating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 px-2 py-0.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isMealAiEstimating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Estimating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>✨ AI estimate</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={mealDesc}
                  onChange={e => setMealDesc(e.target.value)}
                  placeholder="e.g. 4 roti + 1 katori dal + 150g paneer"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                />

                {mealAiNotice && (
                  <div
                    className={cn(
                      'p-2.5 rounded-xl text-xs mt-2 border leading-relaxed',
                      mealAiNotice.type === 'missing_key'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : mealAiNotice.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                    )}
                  >
                    {mealAiNotice.type === 'missing_key' ? (
                      <div>
                        Add your Gemini API key in <span className="font-bold underline">Settings</span> — free from{' '}
                        <a
                          href="https://aistudio.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#22C55E] underline font-bold inline-flex items-center gap-0.5"
                        >
                          <span>Google AI Studio (aistudio.google.com)</span>
                          <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      </div>
                    ) : (
                      <span>{mealAiNotice.message}</span>
                    )}
                  </div>
                )}
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
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                Log Meal
              </button>
            </form>
          )}

          {/* TAB: WORKOUT */}
          {activeTab === 'workout' && (
            <form onSubmit={handleAddWorkout} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Workout Name
                  </label>
                  <button
                    type="button"
                    onClick={handleWorkoutAiEstimate}
                    disabled={isWorkoutAiEstimating}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 px-2 py-0.5 rounded-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isWorkoutAiEstimating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Estimating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>✨ AI estimate</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={woName}
                  onChange={e => setWoName(e.target.value)}
                  placeholder="e.g. Calisthenics Dips & Pull-ups"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                />

                {workoutAiNotice && (
                  <div
                    className={cn(
                      'p-2.5 rounded-xl text-xs mt-2 border leading-relaxed',
                      workoutAiNotice.type === 'missing_key'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : workoutAiNotice.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                    )}
                  >
                    {workoutAiNotice.type === 'missing_key' ? (
                      <div>
                        Add your Gemini API key in <span className="font-bold underline">Settings</span> — free from{' '}
                        <a
                          href="https://aistudio.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#22C55E] underline font-bold inline-flex items-center gap-0.5"
                        >
                          <span>Google AI Studio (aistudio.google.com)</span>
                          <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      </div>
                    ) : (
                      <span>{workoutAiNotice.message}</span>
                    )}
                  </div>
                )}
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
                  placeholder="e.g. Pull-ups 4x8&#10;Dips 4x12"
                  className="w-full bg-[#18201C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                Log Workout (+10 Pts)
              </button>
            </form>
          )}

          {/* TAB: SLEEP (NEW) */}
          {activeTab === 'sleep' && (
            <form onSubmit={handleSaveSleep} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Bedtime</span>
                  </label>
                  <input
                    type="time"
                    value={sleepStart}
                    onChange={e => setSleepStart(e.target.value)}
                    required
                    className="w-full bg-[#18201C] border border-white/[0.08] focus:border-[#22C55E] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none transition-colors [color-scheme:dark]"
                  />
                  {sleepStart && (
                    <span className="block text-[11px] text-zinc-500 mt-1 pl-1">
                      {formatTime12h(sleepStart)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Wake Time</span>
                  </label>
                  <input
                    type="time"
                    value={sleepEnd}
                    onChange={e => setSleepEnd(e.target.value)}
                    required
                    className="w-full bg-[#18201C] border border-white/[0.08] focus:border-[#22C55E] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none transition-colors [color-scheme:dark]"
                  />
                  {sleepEnd && (
                    <span className="block text-[11px] text-zinc-500 mt-1 pl-1">
                      {formatTime12h(sleepEnd)}
                    </span>
                  )}
                </div>
              </div>

              {/* Duration Preview Card */}
              {sleepDurationHours !== null ? (
                <div className="p-4 rounded-xl bg-[#18201C] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Total Sleep</span>
                    <span className="text-lg font-black text-[#22C55E] tracking-tight">
                      {sleepDurationHours}h
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                    <span>Schedule:</span>
                    <span className="font-medium text-zinc-300">
                      {formatTime12h(sleepStart)} → {formatTime12h(sleepEnd)}
                    </span>
                  </div>

                  <div className="pt-1.5 flex flex-wrap gap-1.5">
                    {isSleepDurationGood() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                        <Sparkles className="w-2.5 h-2.5" />
                        +10 pts optimal 7–8.5h
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">
                        Goal: 7.0–8.5 hours
                      </span>
                    )}
                    {isSleepBedtimeGood() && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                        <Sparkles className="w-2.5 h-2.5" />
                        +5 pts before 23:30
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#18201C]/60 border border-white/[0.04] text-xs text-zinc-500 text-center">
                  Enter bedtime and wake time to compute duration
                </div>
              )}

              <button
                type="submit"
                disabled={!sleepStart || !sleepEnd}
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                Save Sleep (+Pts)
              </button>
            </form>
          )}

          {/* TAB: WEIGHT */}
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
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                Save Weight (+5 Pts)
              </button>
            </form>
          )}

          {/* TAB: STEPS */}
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
                className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                Save Steps
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
