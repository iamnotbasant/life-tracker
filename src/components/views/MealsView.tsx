'use client';

import React from 'react';
import Image from 'next/image';
import { UtensilsCrossed, Plus, Trash2, Flame, Award, Clock, Sparkles } from 'lucide-react';
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
  const calorieMaintainTarget = profile.calorieGoalMaintain || 2300;
  const proteinMin = profile.proteinGoalMin || 85;
  const proteinMax = profile.proteinGoalMax || 100;

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
    <div className="space-y-5 pb-24">
      {/* Top Title & Log CTA */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#84CC16] uppercase tracking-wider">
            Nutrition & Macros
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            {formatDateLabel(activeDate)}
          </h3>
        </div>

        <button
          onClick={() => onOpenQuickLog('meal')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#84CC16] to-[#A3E635] text-black font-bold text-xs shadow-lg shadow-[#84CC16]/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. DUAL TARGET PROGRESS CARDS: CALORIES & PROTEIN
         ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Calorie Card */}
        <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calorie Fuel
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                totalKcal >= 2400 && totalKcal <= 2650
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : totalKcal >= 2200
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {totalKcal >= 2400 && totalKcal <= 2650 ? 'Gain Zone (+10)' : totalKcal >= 2200 ? 'Maintain (+5)' : 'Under Target'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{totalKcal}</span>
              <span className="text-xs font-semibold text-slate-400">/ {calorieGainTarget} kcal</span>
            </div>
            <span className="text-xs font-bold text-[#84CC16]">{kcalPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2.5 w-full bg-[#182238] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#84CC16] to-[#A3E635] rounded-full transition-all duration-500"
              style={{ width: `${kcalPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            <span>Maintain: {calorieMaintainTarget} kcal</span>
            <span>Target Gain: {calorieGainTarget} kcal</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Protein
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                totalProtein >= proteinMin
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : totalProtein >= 65
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {totalProtein >= proteinMin ? 'Goal Hit (+10)' : totalProtein >= 65 ? 'Close (+5)' : 'Low (-5)'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{totalProtein}</span>
              <span className="text-xs font-semibold text-slate-400">/ {proteinMin}–{proteinMax}g</span>
            </div>
            <span className="text-xs font-bold text-[#38BDF8]">{proteinPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2.5 w-full bg-[#182238] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            <span>Minimum: {proteinMin}g</span>
            <span>Optimal: {proteinMax}g</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK COMMONLY LOGGED MEALS
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#101728] border border-white/[0.08] rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Frequent Foods & Shakes</span>
          </h4>
          <span className="text-[10px] text-slate-400">Tap to add</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickItems.map((it, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAdd(it)}
              className="shrink-0 p-3 rounded-2xl bg-[#0B101D] hover:bg-[#152138] border border-white/[0.06] hover:border-[#84CC16]/40 text-left transition-all active:scale-95 min-w-[170px]"
            >
              <div className="text-xs font-bold text-white truncate">{it.desc}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                <span className="text-[#84CC16] font-semibold">{it.kcal} kcal</span>
                <span>•</span>
                <span className="text-[#38BDF8] font-semibold">{it.pro}g pro</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. LOGGED MEALS LIST OR EMPTY STATE
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Logged Food Entries ({meals.length})
        </h4>

        {meals.length === 0 ? (
          /* Empty state wiring in empty-meals.png */
          <div className="bg-[#111726] border border-white/[0.08] rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="relative w-40 h-40 mb-3 opacity-90">
              <Image
                src="/assets/empty-meals.png"
                alt="No meals logged"
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
            <h5 className="text-base font-bold text-white">No meals recorded today</h5>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              Log your breakfast, lunch, snacks, and dinner to stay in healthy caloric surplus and hit 85g+ protein.
            </p>
            <button
              onClick={() => onOpenQuickLog('meal')}
              className="py-2.5 px-5 rounded-2xl bg-[#84CC16] hover:bg-[#65A30D] text-black font-bold text-xs shadow-md shadow-[#84CC16]/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your First Meal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-3xl bg-[#111726] border border-white/[0.08] hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.05] text-[#84CC16]">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#84CC16]/15 text-[#A3E635]">
                        {m.mealType}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{m.time}</span>
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-1">
                      {m.description}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black text-white">{m.calories} <span className="text-xs font-normal text-slate-400">kcal</span></div>
                    <div className="text-xs font-bold text-[#38BDF8]">{m.protein}g protein</div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(m.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
