'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Save,
  Footprints,
  Scale,
  Zap,
  Flame,
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
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Configuration & Storage
        </span>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Profile, Targets & Backups
        </h3>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. QUICK MODULE ACCESS
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-5 shadow-lg">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
          Direct Module Access
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onSelectTab('walk')}
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[#F95738]">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F95738]">Walk Sessions</div>
              <div className="text-[10px] text-zinc-500">Widget view</div>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('calories')}
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[#FACC15]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#FACC15]">Energy Split</div>
              <div className="text-[10px] text-zinc-500">BMR + 3-way</div>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('weight')}
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[#F95738]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F95738]">Weight Gain</div>
              <div className="text-[10px] text-zinc-500">48.9 kg</div>
            </div>
          </button>

          <button
            onClick={onOpenPointsInfo}
            className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[#FACC15]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#FACC15]">Points Rules</div>
              <div className="text-[10px] text-zinc-500">Scoring breakdown</div>
            </div>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. USER PROFILE & TARGETS EDIT FORM
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Initials-in-circle avatar per Rule 6 */}
            <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-base flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Physical Profile</h4>
              <p className="text-xs text-zinc-500">Feeds Mifflin-St Jeor BMR & Steps Factor</p>
            </div>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.weightKg}
                onChange={e => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Height (cm) — For BMR
              </label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={e => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Age (years) — For BMR
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Maintenance Calories (kcal)
              </label>
              <input
                type="number"
                value={profile.calorieGoalMaintain}
                onChange={e => setProfile({ ...profile, calorieGoalMaintain: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Surplus Gain Calories (kcal)
              </label>
              <input
                type="number"
                value={profile.calorieGoalGain}
                onChange={e => setProfile({ ...profile, calorieGoalGain: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Protein Target (Min g)
              </label>
              <input
                type="number"
                value={profile.proteinGoalMin}
                onChange={e => setProfile({ ...profile, proteinGoalMin: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Daily Steps Target
              </label>
              <input
                type="number"
                value={profile.stepsGoal}
                onChange={e => setProfile({ ...profile, stepsGoal: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FACC15]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#FACC15] text-black font-bold text-sm hover:bg-[#FDE047] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Targets</span>
          </button>
        </form>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. DATA MANAGEMENT (EXPORT / IMPORT BACKUP JSON)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#121214] border border-white/[0.06] rounded-3xl p-6 shadow-xl">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Data Management
        </h4>
        <p className="text-xs text-zinc-500 mb-4">
          All data is saved in localStorage. Back up anytime to JSON.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Export Backup JSON</div>
              <div className="text-[10px] text-zinc-500">Download snapshot</div>
            </div>
          </button>

          {/* Import */}
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
              className="w-full p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.04] text-left transition-all flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Import Backup JSON</div>
                <div className="text-[10px] text-zinc-500">Restore snapshot</div>
              </div>
            </button>
          </div>
        </div>

        {/* Reset & Onboarding actions */}
        <div className="mt-4 pt-4 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReplayOnboarding}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Welcome Screen</span>
          </button>

          <button
            onClick={handleResetSeed}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Seed</span>
          </button>
        </div>
      </section>
    </div>
  );
};
