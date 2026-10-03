'use client';

import React from 'react';
import { UtensilsCrossed, Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { AppState, MealEntry, MealType } from '../../lib/types';
import { formatDateLabel } from '../../lib/utils';

interface MealsViewProps {
  state: AppState;
  onAddMeal: (meal: MealEntry) => void;
  onDeleteMeal: (mealId: string) => void;
  onOpenQuickLog: (tab: 'meal') => void;
}

export const MealsView: React.FC<MealsViewProps> = ({
  state,
  onAddMeal,
  onDeleteMeal,
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

  const meals = currentDay.meals || [];

  // Totals
  const totalKcal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);

  // Targets
  const calorieGainTarget = profile.calorieGoalGain || 2500;
  const proteinMin = profile.proteinGoalMin || 85;

  const kcalPercent = Math.min(Math.round((totalKcal / calorieGainTarget) * 100), 100);
  const proteinPercent = Math.min(Math.round((totalProtein / proteinMin) * 100), 100);

  // Common quick items for Basant
  const quickItems = [
    { desc: '300ml toned milk', kcal: 180, pro: 9.5, type: 'breakfast' as MealType },
    { desc: '2 sooji laddu', kcal: 315, pro: 3.5, type: 'snack' as MealType },
    { desc: 'Paneer bhurji (150g) + 4 roti', kcal: 680, pro: 34, type: 'lunch' as MealType },
    { desc: '5 roti + 2 katori dal', kcal: 840, pro: 33.5, type: 'dinner' as MealType },
    { desc: 'Banana peanut butter shake (400ml)', kcal: 450, pro: 18, type: 'snack' as MealType },
  ];

  const handleQuickAdd = (item: typeof quickItems[0]) => {
    const newMeal: MealEntry = {
      id: `m-quick-${Date.now()}`,
      mealType: item.type,
      description: item.desc,
      calories: item.kcal,
      protein: item.pro,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    onAddMeal(newMeal);
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
            Nutrition & Fuel
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {formatDateLabel(activeDate)}
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('meal')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#FDE047] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. DUAL TARGET PROGRESS CARDS: CALORIES & PROTEIN
         ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Calorie Card */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Calorie Fuel
            </span>
            <span className="text-xs font-bold text-[#FACC15]">{kcalPercent}%</span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-4xl font-black text-white">{totalKcal}</span>
            <span className="text-xs text-zinc-500 font-semibold">/ {calorieGainTarget} kcal</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.04]">
            <div
              className="h-full bg-[#FACC15] rounded-full transition-all duration-500"
              style={{ width: `${kcalPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-2">
            Target Surplus: 2,500 kcal gain
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Daily Protein
            </span>
            <span className="text-xs font-bold text-[#FACC15]">{proteinPercent}%</span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-4xl font-black text-white">{totalProtein}g</span>
            <span className="text-xs text-zinc-500 font-semibold">/ {proteinMin}g+</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.04]">
            <div
              className="h-full bg-[#FACC15] rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-2">
            Target Range: 85–100g daily
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK COMMONLY LOGGED MEALS
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Frequent Foods</span>
          </h4>
          <span className="text-[10px] text-zinc-500">Tap to add</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickItems.map((it, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAdd(it)}
              className="shrink-0 p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all active:scale-95 min-w-[160px]"
            >
              <div className="text-xs font-bold text-white truncate">{it.desc}</div>
              <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                <span className="text-[#FACC15] font-semibold">{it.kcal} kcal</span>
                <span>•</span>
                <span>{it.pro}g pro</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. LOGGED MEALS LIST OR EMPTY STATE (No image, plain Lucide icon per brief)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Logged Food Entries ({meals.length})
        </h4>

        {meals.length === 0 ? (
          /* Empty state: plain Lucide icon + one line text per Rule 6 */
          <div className="bg-[#121214] border border-white/[0.06] rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-300 mb-4">No meals recorded today</p>
            <button
              onClick={() => onOpenQuickLog('meal')}
              className="py-2.5 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#FDE047] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Meal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121214] border border-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-[#FACC15]">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {m.mealType}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{m.time}</span>
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-0.5">
                      {m.description}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{m.calories} <span className="text-[10px] font-normal text-zinc-500">kcal</span></div>
                    <div className="text-xs font-semibold text-[#FACC15]">{m.protein}g protein</div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(m.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
