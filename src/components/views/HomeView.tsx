'use client';

import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  MapPin,
  Zap,
} from 'lucide-react';
import { AppState, TabType, MealType } from '../../lib/types';
import { calculateBMR, estimateStepsCalories } from '../../lib/points';
import { formatDateLabel, cn } from '../../lib/utils';

interface HomeViewProps {
  state: AppState;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog?: (tab?: 'steps' | 'meal' | 'walk' | 'workout' | 'weight') => void;
  onOpenPointsInfo: () => void;
  streak: number;
  onDateChange?: (newDate: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onSelectTab,
  onOpenPointsInfo,
  streak,
  onDateChange,
}) => {
  const { profile, activeDate, days } = state;
  const day = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(prev => (prev === cardId ? null : cardId));
  };

  // Calculations for current active date
  const steps = day.steps || 0;
  const stepsGoal = profile.stepsGoal || 10000;
  const stepsPercent = Math.min(Math.round((steps / stepsGoal) * 100), 100);
  const stepsBurned = estimateStepsCalories(steps, profile.stepCalorieFactor);

  const workouts = day.workouts || [];
  const workoutBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const totalBurned = bmr + stepsBurned + workoutBurned;

  const meals = day.meals || [];
  const totalKcal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);

  const netKcal = totalKcal - totalBurned;
  const targetKcal = profile.calorieGoalGain || 2500;
  const caloriePercent = Math.min(Math.round((totalKcal / targetKcal) * 100), 100);
  const netDiff = netKcal - targetKcal;
  const netDiffFormatted = `${netDiff >= 0 ? '+' : ''}${netDiff.toLocaleString()} vs target`;

  const walks = day.walks || [];
  const totalWalkKm = walks.reduce((sum, w) => sum + (w.distanceKm || 0), 0);
  const totalWalkSteps = walks.reduce((sum, w) => sum + (w.steps || 0), 0);
  const totalWalkMin = walks.reduce((sum, w) => sum + (w.durationMin || 0), 0);

  // All-time total points
  const totalAllTimePoints = Object.values(days).reduce((sum, d) => sum + (d.points || 0), 0);

  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'B';

  const handlePrevDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleOpenDatePicker = () => {
    if (!dateInputRef.current) return;
    try {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
        return;
      }
    } catch {}
    dateInputRef.current.focus();
  };

  const isToday = activeDate === '2026-10-03' || activeDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? `Today, ${formatDateLabel(activeDate)}` : formatDateLabel(activeDate);

  // 7-day strip calculation for steps card
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - (6 - i));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const dayData = days[dateKey];
    const daySteps = dayData?.steps || 0;
    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
    const isSelected = dateKey === activeDate;
    return { dateKey, daySteps, dayLetter, isSelected };
  });
  const maxSteps7d = Math.max(stepsGoal, ...last7Days.map(d => d.daySteps), 1);

  const mealGroups: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'BREAKFAST' },
    { type: 'lunch', label: 'LUNCH' },
    { type: 'snack', label: 'SNACK' },
    { type: 'dinner', label: 'DINNER' },
  ];

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          HEADER: "Life Tracker" + Streak badge + Avatar initial circle
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Life Tracker</h1>
          <button
            onClick={onOpenPointsInfo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#22C55E] hover:underline mt-0.5"
            aria-label="View points & streak rules"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{streak}d streak</span>
          </button>
        </div>

        {/* Avatar initial circle */}
        <button
          onClick={() => onSelectTab('settings')}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-white font-bold text-sm flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="Profile & Settings"
          aria-label="Profile & Settings"
        >
          {initial}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PROMINENT DATE NAVIGATOR: [< 48px] [ Date Pill + Picker ] [> 48px]
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-1 pb-1">
        <button
          type="button"
          onClick={handlePrevDay}
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 hover:text-white text-zinc-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <button
            type="button"
            onClick={handleOpenDatePicker}
            className="w-full h-12 min-h-[48px] px-4 rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm text-center group"
            aria-label="Select date"
          >
            <Calendar className="w-4 h-4 text-[#22C55E]/80 group-hover:text-[#22C55E] transition-colors shrink-0" />
            <span className="text-sm font-semibold text-white tracking-wide truncate">
              {dateLabel}
            </span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={activeDate}
            onChange={(e) => {
              if (e.target.value && onDateChange) {
                onDateChange(e.target.value);
              }
            }}
            className="sr-only"
            tabIndex={-1}
            aria-label="Select date"
          />
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 hover:text-white text-zinc-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: "Today's Points" (Expandable breakdown)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => toggleCard('points')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Today's Points</span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#22C55E]/60 group-hover:text-[#22C55E] transition-colors" />
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                expandedCard === 'points' && "rotate-180"
              )}
            />
          </div>
        </div>
        <div className="text-5xl font-black text-[#22C55E] tracking-tight my-1">
          {day.points >= 0 ? `+${day.points}` : day.points}
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalAllTimePoints} total
        </div>

        {/* Inline Expanded Points Breakdown */}
        {expandedCard === 'points' && (
          <div className="pt-3 mt-3 border-t border-white/[0.05]">
            {!day.pointsBreakdown ? (
              <div className="text-sm text-zinc-500 py-1">No breakdown yet</div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {[
                  { label: 'Calories', pts: day.pointsBreakdown.caloriesPts },
                  { label: 'Protein', pts: day.pointsBreakdown.proteinPts },
                  { label: 'Steps', pts: day.pointsBreakdown.stepsPts },
                  { label: 'Workout', pts: day.pointsBreakdown.workoutPts },
                  { label: 'Sleep', pts: day.pointsBreakdown.sleepPts },
                  { label: 'Weight', pts: day.pointsBreakdown.weightPts },
                  { label: 'Streak', pts: day.pointsBreakdown.streakPts },
                ].map((item) => (
                  <div key={item.label} className="py-1.5 flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{item.label}</span>
                    <span
                      className={cn(
                        "font-semibold text-xs",
                        item.pts > 0 ? "text-[#22C55E]" : item.pts < 0 ? "text-rose-400" : "text-zinc-500"
                      )}
                    >
                      {item.pts > 0 ? `+${item.pts} pts` : item.pts < 0 ? `${item.pts} pts` : '0 pts'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-white/[0.05] mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPointsInfo();
                }}
                className="text-xs text-[#22C55E] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Points Guide →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: "Calories" (Expandable breakdown)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => toggleCard('calories')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Calories</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                expandedCard === 'calories' && "rotate-180"
              )}
            />
          </div>
        </div>
        <div className="text-3xl font-black text-white tracking-tight my-1.5">
          {totalKcal.toLocaleString()} <span className="text-zinc-500 text-lg font-normal">/ {targetKcal.toLocaleString()} kcal</span>
        </div>
        {/* Emerald green bar */}
        <div className="h-2 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium mt-2 flex items-center justify-between">
          <span>Net {netKcal >= 0 ? `+${netKcal}` : netKcal} kcal</span>
          <span>{caloriePercent}% of goal</span>
        </div>

        {/* Inline Expanded Calories Detail */}
        {expandedCard === 'calories' && (
          <div className="pt-3 mt-3 border-t border-white/[0.05] space-y-1.5 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
              <span className="text-zinc-400">Consumed</span>
              <span className="text-white font-medium">{totalKcal.toLocaleString()} kcal</span>
            </div>

            <div className="py-1 border-b border-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Burned</span>
                <span className="text-white font-medium">{totalBurned.toLocaleString()} kcal</span>
              </div>
              <div className="pl-3 pt-1 space-y-0.5 text-xs text-zinc-500">
                <div className="flex items-center justify-between">
                  <span>Workout</span>
                  <span className="text-zinc-400">{workoutBurned.toLocaleString()} kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Steps/Walk</span>
                  <span className="text-zinc-400">{stepsBurned.toLocaleString()} kcal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Base</span>
                  <span className="text-zinc-400">{bmr.toLocaleString()} kcal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
              <span className="text-zinc-400">Net</span>
              <div className="text-right">
                <span className="text-white font-medium">{netKcal >= 0 ? `+${netKcal.toLocaleString()}` : netKcal.toLocaleString()} kcal</span>
                <span className="text-xs text-zinc-500 ml-1.5">vs target {targetKcal.toLocaleString()} ({netDiffFormatted})</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('calories');
                }}
                className="text-xs text-[#22C55E] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Calories →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: "Steps" (Expandable goal bar + 7-day mini strip)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => toggleCard('steps')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Steps</span>
          <div className="flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                expandedCard === 'steps' && "rotate-180"
              )}
            />
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {steps.toLocaleString()}
        </div>
        {/* Goal progress bar in collapsed view */}
        <div className="h-1.5 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02] my-1.5">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${stepsPercent}%` }}
          />
        </div>
        <div className="text-[11px] text-zinc-500 font-medium flex items-center justify-between">
          <span>goal {stepsGoal.toLocaleString()}</span>
          <span>{stepsPercent}%</span>
        </div>

        {/* Inline Expanded Steps Detail */}
        {expandedCard === 'steps' && (
          <div className="pt-3 mt-3 border-t border-white/[0.05]">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Goal Progress</span>
              <span className="text-white font-medium">{steps.toLocaleString()} / {stepsGoal.toLocaleString()} ({stepsPercent}%)</span>
            </div>
            <div className="h-2 w-full bg-[#18201C] rounded-full overflow-hidden border border-white/[0.02] mb-3">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>

            {/* 7-day mini bar strip */}
            <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-1.5">
              Last 7 Days
            </div>
            <div className="flex items-end justify-between gap-1.5 bg-[#0e1411] p-2.5 rounded-xl border border-white/[0.04]">
              {last7Days.map((d) => (
                <div key={d.dateKey} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full h-12 bg-[#18201C] rounded-md flex items-end p-0.5 justify-center overflow-hidden">
                    <div
                      className={cn(
                        "w-full rounded-sm transition-all duration-300",
                        d.isSelected ? "bg-[#22C55E]" : "bg-zinc-700"
                      )}
                      style={{
                        height: `${Math.min(Math.max(Math.round((d.daySteps / maxSteps7d) * 100), 6), 100)}%`,
                      }}
                      title={`${d.dateKey}: ${d.daySteps.toLocaleString()} steps`}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px]",
                      d.isSelected ? "text-[#22C55E] font-bold" : "text-zinc-500"
                    )}
                  >
                    {d.dayLetter}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.05] mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('steps');
                }}
                className="text-xs text-[#22C55E] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Steps →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 4: "Walk" (Expandable session list)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => toggleCard('walk')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Walk</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                expandedCard === 'walk' && "rotate-180"
              )}
            />
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {totalWalkKm.toFixed(1)} <span className="text-lg font-normal text-zinc-500">km</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalWalkSteps > 0 ? `${totalWalkSteps.toLocaleString()} steps • ${totalWalkMin} min` : 'No walks logged'}
        </div>

        {/* Inline Expanded Walk Detail */}
        {expandedCard === 'walk' && (
          <div className="pt-3 mt-3 border-t border-white/[0.05]">
            {walks.length === 0 ? (
              <div className="text-sm text-zinc-500 py-1">No walks logged</div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {walks.map((w) => (
                  <div key={w.id} className="py-1.5 flex items-center justify-between text-sm gap-2">
                    <span className="font-medium text-white truncate">{w.title || 'Walk'}</span>
                    <span className="text-xs text-zinc-400 shrink-0">
                      {w.distanceKm} km • {w.durationMin} min • {w.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-white/[0.05] mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('walk');
                }}
                className="text-xs text-[#22C55E] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Walk →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 5: "Workout" (Expandable workout list)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => toggleCard('workout')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Workout</span>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                expandedCard === 'workout' && "rotate-180"
              )}
            />
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {workoutBurned} <span className="text-lg font-normal text-zinc-500">kcal burned</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {workouts.length > 0 ? `${workouts.length} session${workouts.length > 1 ? 's' : ''} logged` : '0 min active'}
        </div>

        {/* Inline Expanded Workout Detail */}
        {expandedCard === 'workout' && (
          <div className="pt-3 mt-3 border-t border-white/[0.05]">
            {workouts.length === 0 ? (
              <div className="text-sm text-zinc-500 py-1">No workouts logged</div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {workouts.map((w) => {
                  const exerciseNames = w.exercises?.map(e => e.name).filter(Boolean).join(', ');
                  return (
                    <div key={w.id} className="py-1.5 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-white truncate">{w.name}</span>
                        <span className="text-xs text-zinc-400 shrink-0">
                          {w.durationMin} min • {w.calories} kcal
                        </span>
                      </div>
                      {exerciseNames ? (
                        <div className="text-xs text-zinc-500 truncate mt-0.5">
                          {exerciseNames}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="pt-2 border-t border-white/[0.05] mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('workout');
                }}
                className="text-xs text-[#22C55E] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Workout →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 6: "Meals" (Expandable meals grouped timeline)
         ───────────────────────────────────────────────────────────── */}
      <div
        onClick={() => toggleCard('meals')}
        className="bg-[#121815] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Meals</span>
          <div className="flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                expandedCard === 'meals' && "rotate-180"
              )}
            />
          </div>
        </div>
        <div className="text-4xl font-black text-white tracking-tight my-1">
          {totalKcal} <span className="text-lg font-normal text-zinc-500">kcal</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalProtein}g protein • {meals.length} logged
        </div>

        {/* Inline Expanded Meals Detail */}
        {expandedCard === 'meals' && (
          <div className="pt-3 mt-3 border-t border-white/[0.05]">
            {meals.length === 0 ? (
              <div className="text-sm text-zinc-500 py-1">No meals logged yet</div>
            ) : (
              <div className="space-y-2">
                {mealGroups.map((group) => {
                  const groupMeals = meals.filter(m => m.mealType === group.type);
                  if (groupMeals.length === 0) return null;
                  return (
                    <div key={group.type} className="pt-1 first:pt-0">
                      <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-1">
                        {group.label}
                      </div>
                      <div className="divide-y divide-white/[0.05]">
                        {groupMeals.map((m) => (
                          <div key={m.id} className="py-1 flex items-center justify-between text-sm gap-2">
                            <span className="truncate text-zinc-200">{m.description}</span>
                            <span className="shrink-0 text-right whitespace-nowrap">
                              <span className="text-white font-medium">{m.calories} kcal</span>
                              <span className="text-zinc-500 text-xs ml-1.5">{m.protein}g protein</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Footer row */}
                <div className="border-t border-white/[0.05] pt-2 mt-2 flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>TOTAL</span>
                  <span>{totalKcal} kcal • {totalProtein}g protein</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-white/[0.05] mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('meals');
                }}
                className="text-xs text-[#22C55E] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Open Meals →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
