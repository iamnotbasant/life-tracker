'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle,
} from 'lucide-react';
import { AppState, TabType, UserProfile } from '../../lib/types';
import { exportBackupJSON, parseAndImportBackupJSON } from '../../lib/storage';
import { getInitialSeedData } from '../../lib/seed-data';

interface SettingsViewProps {
  state: AppState;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onRestoreState: (newState: AppState) => void;
  onSelectTab: (tab: TabType) => void;
  onReplayOnboarding: () => void;
  onOpenPointsInfo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateProfile,
  onRestoreState,
  onSelectTab,
  onReplayOnboarding,
  onOpenPointsInfo,
}) => {
  const [profile, setProfile] = useState<UserProfile>({ ...state.profile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExport = () => {
    exportBackupJSON(state);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = parseAndImportBackupJSON(text, state);
        onRestoreState(imported);
        alert('Backup data imported successfully!');
      } catch (err) {
        alert('Failed to parse backup JSON file. Please ensure it is a valid tracker backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (confirm('Reset tracker data to initial seed?')) {
      const seed = getInitialSeedData();
      onRestoreState(seed);
    }
  };

  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'B';

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div className="flex items-center gap-2">
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('home')}
              className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <span className="text-xl">←</span>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Profile, goals & data backup</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Profile & Physical Baseline (Plain card list)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18201C] border border-white/[0.08] text-white font-bold text-sm flex items-center justify-center">
              {initial}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Physical Profile</h3>
              <p className="text-[11px] text-zinc-500">BMR & formula calibration</p>
            </div>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.weightKg}
                onChange={e => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={e => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#22C55E] text-black font-bold text-xs hover:bg-[#16A34A] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Goals
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Daily Goals
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Gain Calories (kcal)
              </label>
              <input
                type="number"
                value={profile.calorieGoalGain}
                onChange={e => setProfile({ ...profile, calorieGoalGain: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Maintain (kcal)
              </label>
              <input
                type="number"
                value={profile.calorieGoalMaintain}
                onChange={e => setProfile({ ...profile, calorieGoalMaintain: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Min Protein (g)
              </label>
              <input
                type="number"
                value={profile.proteinGoalMin}
                onChange={e => setProfile({ ...profile, proteinGoalMin: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Steps Goal
              </label>
              <input
                type="number"
                value={profile.stepsGoal}
                onChange={e => setProfile({ ...profile, stepsGoal: Number(e.target.value) })}
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#22C55E] text-black font-bold text-xs hover:bg-[#16A34A] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Goals</span>
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 3: Data Management (Plain Card List: Export / Import / Reset)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
          Export / Import & Storage
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="p-3 rounded-xl bg-[#18201C] hover:bg-zinc-800 border border-white/[0.04] text-left transition-all flex items-center gap-2.5"
          >
            <Download className="w-4 h-4 text-[#22C55E] shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Export JSON</div>
              <div className="text-[10px] text-zinc-500">Backup all data</div>
            </div>
          </button>

          {/* Import button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 rounded-xl bg-[#18201C] hover:bg-zinc-800 border border-white/[0.04] text-left transition-all flex items-center gap-2.5"
            >
              <Upload className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Import JSON</div>
                <div className="text-[10px] text-zinc-500">Restore snapshot</div>
              </div>
            </button>
          </div>
        </div>

        {/* Action row: Welcome screen + Reset seed */}
        <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
          <button
            onClick={onReplayOnboarding}
            className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#18201C] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Welcome Screen</span>
          </button>

          <button
            onClick={handleResetSeed}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
