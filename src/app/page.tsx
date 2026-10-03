'use client';

import React, { useState, useEffect } from 'react';
import { AppState, TabType, MealEntry, WalkSession, WorkoutEntry, UserProfile } from '../lib/types';
import { loadAppState, saveAppState } from '../lib/storage';
import { calculateDayPoints } from '../lib/points';
import { calculateStreak } from '../lib/utils';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { OnboardingModal } from '../components/OnboardingModal';
import { PointsInfoModal } from '../components/PointsInfoModal';
import { QuickLogModal } from '../components/QuickLogModal';
import { HomeView } from '../components/views/HomeView';
import { StepsView } from '../components/views/StepsView';
import { WalkView } from '../components/views/WalkView';
import { WorkoutView } from '../components/views/WorkoutView';
import { MealsView } from '../components/views/MealsView';
import { CaloriesView } from '../components/views/CaloriesView';
import { WeightView } from '../components/views/WeightView';
import { HistoryView } from '../components/views/HistoryView';
import { SettingsView } from '../components/views/SettingsView';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPointsInfoOpen, setIsPointsInfoOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogDefaultTab, setQuickLogDefaultTab] = useState<'steps' | 'meal' | 'walk' | 'workout' | 'weight'>('steps');

  // Load state on client mount
  useEffect(() => {
    const loaded = loadAppState();
    setState(loaded);
    if (!loaded.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Save state on any change
  useEffect(() => {
    if (state) {
      saveAppState(state);
    }
  }, [state]);

  if (!state) {
    return (
      <div className="min-h-screen bg-[#070A11] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FF5E1E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Loading Life Tracker...
          </span>
        </div>
      </div>
    );
  }

  const { activeDate, profile, days } = state;
  const currentDay = days[activeDate] || {
    date: activeDate,
    steps: 0,
    meals: [],
    walks: [],
    workouts: [],
    points: 0,
  };

  const streak = calculateStreak(days, activeDate);

  // Helper to update state with recalculated points
  const updateDayData = (dateStr: string, updater: (prev: typeof currentDay) => typeof currentDay) => {
    setState(prev => {
      if (!prev) return prev;
      const existing = prev.days[dateStr] || {
        date: dateStr,
        steps: 0,
        meals: [],
        walks: [],
        workouts: [],
        points: 0,
      };

      const updated = updater(existing);
      const pointsBreakdown = calculateDayPoints(updated, prev.profile, streak);
      updated.points = pointsBreakdown.total;
      updated.pointsBreakdown = pointsBreakdown;

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateStr]: updated,
        },
      };
    });
  };

  // Actions
  const handleDateChange = (newDate: string) => {
    setState(prev => prev ? { ...prev, activeDate: newDate } : prev);
  };

  const handleUpdateSteps = (dateStr: string, steps: number, note?: string) => {
    updateDayData(dateStr, d => ({
      ...d,
      steps,
      stepsNote: note || d.stepsNote,
    }));
  };

  const handleAddMeal = (meal: MealEntry) => {
    updateDayData(activeDate, d => ({
      ...d,
      meals: [...d.meals, meal],
    }));
  };

  const handleDeleteMeal = (mealId: string) => {
    updateDayData(activeDate, d => ({
      ...d,
      meals: d.meals.filter(m => m.id !== mealId),
    }));
  };

  const handleAddWalk = (walk: WalkSession) => {
    updateDayData(activeDate, d => {
      const newWalks = [...d.walks, walk];
      // Also add walk steps to day's total steps if walk steps are higher
      const newSteps = Math.max(d.steps || 0, (d.steps || 0) + (walk.steps || 0));
      return {
        ...d,
        walks: newWalks,
        steps: newSteps,
      };
    });
  };

  const handleDeleteWalk = (walkId: string) => {
    updateDayData(activeDate, d => ({
      ...d,
      walks: d.walks.filter(w => w.id !== walkId),
    }));
  };

  const handleAddWorkout = (workout: WorkoutEntry) => {
    updateDayData(activeDate, d => ({
      ...d,
      workouts: [...d.workouts, workout],
    }));
  };

  const handleDeleteWorkout = (workoutId: string) => {
    updateDayData(activeDate, d => ({
      ...d,
      workouts: d.workouts.filter(w => w.id !== workoutId),
    }));
  };

  const handleLogWeight = (weight: number, note?: string) => {
    updateDayData(activeDate, d => ({
      ...d,
      weight,
    }));

    setState(prev => {
      if (!prev) return prev;
      const history = [...prev.weightHistory];
      const existingIdx = history.findIndex(w => w.date === activeDate);
      const newEntry = { id: `w-${Date.now()}`, date: activeDate, weightKg: weight, note };

      if (existingIdx >= 0) {
        history[existingIdx] = newEntry;
      } else {
        history.push(newEntry);
      }
      history.sort((a, b) => a.date.localeCompare(b.date));

      return {
        ...prev,
        profile: { ...prev.profile, weightKg: weight },
        weightHistory: history,
      };
    });
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setState(prev => (prev ? { ...prev, profile: newProfile } : prev));
  };

  const handleRestoreState = (newState: AppState) => {
    setState(newState);
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    setState(prev => (prev ? { ...prev, onboardingCompleted: true } : prev));
  };

  const handleOpenQuickLog = (tab: 'steps' | 'meal' | 'walk' | 'workout' | 'weight' = 'steps') => {
    setQuickLogDefaultTab(tab);
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-[#F8FAFC] flex flex-col">
      {/* Top Sticky Header */}
      <Header
        profile={profile}
        activeDate={activeDate}
        onDateChange={handleDateChange}
        streak={streak}
        todayPoints={currentDay.points || 0}
        onOpenPointsInfo={() => setIsPointsInfoOpen(true)}
        onSelectTab={setCurrentTab}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {currentTab === 'home' && (
          <HomeView
            state={state}
            onSelectTab={setCurrentTab}
            onOpenQuickLog={handleOpenQuickLog}
            onOpenPointsInfo={() => setIsPointsInfoOpen(true)}
            streak={streak}
          />
        )}

        {currentTab === 'steps' && (
          <StepsView
            state={state}
            onUpdateSteps={handleUpdateSteps}
            onOpenQuickLog={() => handleOpenQuickLog('steps')}
          />
        )}

        {currentTab === 'walk' && (
          <WalkView
            state={state}
            onAddWalk={handleAddWalk}
            onDeleteWalk={handleDeleteWalk}
            onOpenQuickLog={() => handleOpenQuickLog('walk')}
          />
        )}

        {currentTab === 'workout' && (
          <WorkoutView
            state={state}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onOpenQuickLog={() => handleOpenQuickLog('workout')}
          />
        )}

        {currentTab === 'meals' && (
          <MealsView
            state={state}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onOpenQuickLog={() => handleOpenQuickLog('meal')}
          />
        )}

        {currentTab === 'calories' && (
          <CaloriesView state={state} />
        )}

        {currentTab === 'weight' && (
          <WeightView
            state={state}
            onLogWeight={handleLogWeight}
            onOpenQuickLog={() => handleOpenQuickLog('weight')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView state={state} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            state={state}
            onUpdateProfile={handleUpdateProfile}
            onRestoreState={handleRestoreState}
            onSelectTab={setCurrentTab}
            onReplayOnboarding={() => setIsOnboardingOpen(true)}
            onOpenPointsInfo={() => setIsPointsInfoOpen(true)}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickLog={() => handleOpenQuickLog('steps')}
      />

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      <PointsInfoModal
        isOpen={isPointsInfoOpen}
        onClose={() => setIsPointsInfoOpen(false)}
        day={currentDay}
        profile={profile}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        activeDate={activeDate}
        profile={profile}
        currentSteps={currentDay.steps || 0}
        onSaveSteps={(st, note) => handleUpdateSteps(activeDate, st, note)}
        onAddMeal={handleAddMeal}
        onAddWalk={handleAddWalk}
        onAddWorkout={handleAddWorkout}
        onLogWeight={handleLogWeight}
        defaultTab={quickLogDefaultTab}
      />
    </div>
  );
}
