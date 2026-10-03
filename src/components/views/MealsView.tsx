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
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER: Title top-left + circular icon button top-right
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Meals</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{formatDateLabel(activeDate)}</p>
        </div>

        <button
          onClick={() => onOpenQuickLog('meal')}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="Add Meal"
          aria-label="Add Meal"
        >
          <Plus className="w-5 h-5 text-[#22C55E]" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2 STAT CARDS (kcal bar, protein bar)
         ───────────────────────────────────────────────────────────── */}
      {/* Stat Card 1: Calories Bar */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Calories</span>
          <span className="text-xs font-bold text-[#22C55E]">{kcalPercent}%</span>
        </div>
        <div className="text-3xl font-black text-white tracking-tight my-2">
          {totalKcal} <span className="text-zinc-500 text-lg font-normal">/ {calorieGainTarget} kcal</span>
        </div>
        <div className="h-2.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${kcalPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mt-2">
          {kcalPercent}% of daily surplus target (2,500 kcal)
        </div>
      </div>

      {/* Stat Card 2: Protein Bar */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Protein</span>
          <span className="text-xs font-bold text-[#22C55E]">{proteinPercent}%</span>
        </div>
        <div className="text-3xl font-black text-white tracking-tight my-2">
          {totalProtein} <span className="text-zinc-500 text-lg font-normal">/ {proteinMin}g</span>
        </div>
        <div className="h-2.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${proteinPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mt-2">
          {proteinPercent}% of daily 85g+ target
        </div>
      </div>

      {/* Quick frequent foods pills */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Frequent Foods</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickItems.map((it, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAdd(it)}
              className="p-2.5 rounded-xl bg-[#18201C] hover:bg-zinc-800 border border-white/[0.02] text-left transition-all active:scale-[0.98]"
            >
              <div className="text-xs font-bold text-white truncate">{it.desc}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                <span className="text-[#22C55E] font-medium">{it.kcal} kcal</span> • {it.pro}g pro
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MEAL ENTRY CARDS (name, kcal, protein, time)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2.5 pt-1">
        <div className="text-xs font-semibold text-zinc-400 px-1">
          Meal Entries ({meals.length})
        </div>

        {meals.length === 0 ? (
          /* Empty state: one Lucide icon + one line text */
          <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-8 text-center flex flex-col items-center">
            <UtensilsCrossed className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No meals logged today</p>
          </div>
        ) : (
          meals.map((m) => (
            <div
              key={m.id}
              className="bg-[#121815] border border-white/[0.05] rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-[#18201C] px-1.5 py-0.5 rounded">
                      {m.mealType}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{m.time}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {m.description}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{m.calories} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></div>
                    <div className="text-xs font-semibold text-[#22C55E]">{m.protein}g protein</div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(m.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete meal"
                    aria-label="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
