'use client';

import React, { useState, useEffect } from 'react';
import { AppState, TabType, MealEntry, WorkoutEntry, UserProfile, SleepData } from '../lib/types';
import { loadAppState, saveAppState } from '../lib/storage';
import { calculateDayPoints } from '../lib/points';
import { calculateStreak } from '../lib/utils';
import { BottomNav } from '../components/BottomNav';
import { OnboardingModal } from '../components/OnboardingModal';
import { PointsInfoModal } from '../components/PointsInfoModal';
import { QuickLogModal, QuickLogTab } from '../components/QuickLogModal';
import { HomeView } from '../components/views/HomeView';
import { StepsView } from '../components/views/StepsView';
import { WorkoutView } from '../components/views/WorkoutView';
import { MealsView } from '../components/views/MealsView';
import { WeightView } from '../components/views/WeightView';
import { SleepView } from '../components/views/SleepView';
import { SettingsView } from '../components/views/SettingsView';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [detailView, setDetailView] = useState<'weight' | 'sleep' | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPointsInfoOpen, setIsPointsInfoOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogDefaultTab, setQuickLogDefaultTab] = useState<QuickLogTab>('meal');

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
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
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

  const handleUpdateSleep = (dateStr: string, sleep?: SleepData) => {
    updateDayData(dateStr, d => ({
      ...d,
      sleep,
    }));
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

  const handleLogWeight = (weight: number, noteOrDate?: string, maybeNote?: string) => {
    const isDate = noteOrDate && /^\d{4}-\d{2}-\d{2}$/.test(noteOrDate);
    const targetDate = isDate ? noteOrDate : activeDate;
    const note = isDate ? maybeNote : noteOrDate;

    updateDayData(targetDate, d => ({
      ...d,
      weight,
    }));

    setState(prev => {
      if (!prev) return prev;
      const history = [...prev.weightHistory];
      const existingIdx = history.findIndex(w => w.date === targetDate);
      const newEntry = { id: `w-${Date.now()}`, date: targetDate, weightKg: weight, note };

      if (existingIdx >= 0) {
        history[existingIdx] = newEntry;
      } else {
        history.push(newEntry);
      }
      history.sort((a, b) => a.date.localeCompare(b.date));

      const latestEntry = history[history.length - 1];

      return {
        ...prev,
        profile: { ...prev.profile, weightKg: latestEntry ? latestEntry.weightKg : weight },
        weightHistory: history,
      };
    });
  };

  const handleClearWeight = (dateStr?: string) => {
    const targetDate = dateStr || activeDate;
    updateDayData(targetDate, d => ({
      ...d,
      weight: undefined,
    }));

    setState(prev => {
      if (!prev) return prev;
      const history = prev.weightHistory.filter(w => w.date !== targetDate);
      const latestWeight = history.length > 0 ? history[history.length - 1].weightKg : prev.profile.weightKg;
      return {
        ...prev,
        profile: { ...prev.profile, weightKg: latestWeight },
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

  const handleOpenQuickLog = (tab: QuickLogTab = 'meal') => {
    setQuickLogDefaultTab(tab);
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-zinc-100 flex flex-col font-sans">
      {/* Main View Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 sm:pt-6">
        {/* Full-screen detail views */}
        {detailView === 'weight' && (
          <WeightView
            state={state}
            onLogWeight={handleLogWeight}
            onOpenQuickLog={() => handleOpenQuickLog('weight')}
            onBack={() => setDetailView(null)}
            onSelectTab={(tab) => {
              setDetailView(null);
              setCurrentTab(tab);
            }}
            onDateChange={handleDateChange}
          />
        )}

        {detailView === 'sleep' && (
          <SleepView
            state={state}
            onBack={() => setDetailView(null)}
            onOpenQuickLog={() => handleOpenQuickLog('sleep')}
            onOpenSleepModal={() => handleOpenQuickLog('sleep')}
            onDateChange={handleDateChange}
          />
        )}

        {/* Regular Tab Views */}
        {!detailView && currentTab === 'home' && (
          <HomeView
            state={state}
            onSelectTab={setCurrentTab}
            onOpenQuickLog={handleOpenQuickLog}
            onOpenPointsInfo={() => setIsPointsInfoOpen(true)}
            streak={streak}
            onDateChange={handleDateChange}
            onUpdateSleep={handleUpdateSleep}
            onLogWeight={handleLogWeight}
            onClearWeight={handleClearWeight}
            onOpenWeightPage={() => setDetailView('weight')}
            onOpenSleepPage={() => setDetailView('sleep')}
          />
        )}

        {!detailView && currentTab === 'steps' && (
          <StepsView
            state={state}
            onUpdateSteps={handleUpdateSteps}
            onOpenQuickLog={() => handleOpenQuickLog('steps')}
            onDateChange={handleDateChange}
          />
        )}

        {!detailView && currentTab === 'workout' && (
          <WorkoutView
            state={state}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onOpenQuickLog={() => handleOpenQuickLog('workout')}
            onDateChange={handleDateChange}
          />
        )}

        {!detailView && currentTab === 'meals' && (
          <MealsView
            state={state}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onOpenQuickLog={() => handleOpenQuickLog('meal')}
            onDateChange={handleDateChange}
          />
        )}

        {!detailView && currentTab === 'weight' && (
          <WeightView
            state={state}
            onLogWeight={handleLogWeight}
            onOpenQuickLog={() => handleOpenQuickLog('weight')}
            onBack={() => setCurrentTab('home')}
            onSelectTab={setCurrentTab}
            onDateChange={handleDateChange}
          />
        )}

        {!detailView && currentTab === 'sleep' && (
          <SleepView
            state={state}
            onBack={() => setCurrentTab('home')}
            onOpenQuickLog={() => handleOpenQuickLog('sleep')}
            onOpenSleepModal={() => handleOpenQuickLog('sleep')}
            onDateChange={handleDateChange}
          />
        )}

        {!detailView && currentTab === 'settings' && (
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
        onSelectTab={(tab) => {
          setDetailView(null);
          setCurrentTab(tab);
        }}
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
        currentSleep={currentDay.sleep}
        onSaveSteps={(st, note) => handleUpdateSteps(activeDate, st, note)}
        onAddMeal={handleAddMeal}
        onAddWorkout={handleAddWorkout}
        onLogWeight={handleLogWeight}
        onSaveSleep={(sleep) => handleUpdateSleep(activeDate, sleep)}
        defaultTab={quickLogDefaultTab}
      />
    </div>
  );
}
