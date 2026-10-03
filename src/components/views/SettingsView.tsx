'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Settings as SettingsIcon,
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
  HelpCircle,
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
        alert('Backup data imported successfully! Oct 1–2 history preserved.');
      } catch (err) {
        alert('Failed to parse backup JSON file. Please ensure it is a valid tracker backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (confirm('Reset tracker data to initial seed? (Basant 1–2 Oct history will be restored).')) {
      const seed = getInitialSeedData();
      onRestoreState(seed);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Configuration & Storage
        </span>
        <h3 className="text-xl font-black text-white tracking-tight">
          Profile, Targets & Backups
        </h3>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. QUICK MODULE JUMP SHORTCUTS
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-5 shadow-lg">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Direct Module Access
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onSelectTab('walk')}
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#182238] border border-white/[0.06] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-[#F97316]/15 text-[#F97316]">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F97316]">Walk Sessions</div>
              <div className="text-[10px] text-slate-400">ref-07 style</div>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('calories')}
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#182238] border border-white/[0.06] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#8B5CF6]">Calorie Split</div>
              <div className="text-[10px] text-slate-400">BMR + 3-way</div>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('weight')}
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#182238] border border-white/[0.06] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-[#F43F5E]/15 text-[#F43F5E]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F43F5E]">Weight & Badge</div>
              <div className="text-[10px] text-slate-400">48.9 kg gain</div>
            </div>
          </button>

          <button
            onClick={onOpenPointsInfo}
            className="p-3 rounded-2xl bg-[#0B101D] hover:bg-[#182238] border border-white/[0.06] text-left transition-all group flex items-center gap-2.5"
          >
            <div className="p-2 rounded-xl bg-[#FF5E1E]/15 text-[#FF5E1E]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#FF5E1E]">Points Rules</div>
              <div className="text-[10px] text-slate-400">Scoring breakdown</div>
            </div>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. USER PROFILE & TARGETS EDIT FORM
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#FF5E1E]/40 bg-[#0B101D]">
              <Image
                src="/assets/avatar-basant.png"
                alt="Profile Avatar"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Basant's Physical Profile</h4>
              <p className="text-xs text-slate-400">Feeds Mifflin-St Jeor BMR & Steps Factor</p>
            </div>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.weightKg}
                onChange={e => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Height (cm) — For BMR
              </label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={e => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Age (years) — For BMR
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Maintenance Calories (kcal)
              </label>
              <input
                type="number"
                value={profile.calorieGoalMaintain}
                onChange={e => setProfile({ ...profile, calorieGoalMaintain: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Surplus Gain Calories (kcal)
              </label>
              <input
                type="number"
                value={profile.calorieGoalGain}
                onChange={e => setProfile({ ...profile, calorieGoalGain: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Protein Target (Min g)
              </label>
              <input
                type="number"
                value={profile.proteinGoalMin}
                onChange={e => setProfile({ ...profile, proteinGoalMin: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Protein Target (Max g)
              </label>
              <input
                type="number"
                value={profile.proteinGoalMax}
                onChange={e => setProfile({ ...profile, proteinGoalMax: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Daily Steps Target
              </label>
              <input
                type="number"
                value={profile.stepsGoal}
                onChange={e => setProfile({ ...profile, stepsGoal: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Step Calorie Factor (kcal/step)
              </label>
              <input
                type="number"
                step="0.001"
                value={profile.stepCalorieFactor}
                onChange={e => setProfile({ ...profile, stepCalorieFactor: Number(e.target.value) })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bedtime Target
              </label>
              <input
                type="text"
                value={profile.bedtimeGoal}
                onChange={e => setProfile({ ...profile, bedtimeGoal: e.target.value })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={profile.timezone}
                onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full bg-[#151D30] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF5E1E] to-[#FFA114] text-white font-bold text-sm shadow-lg shadow-[#FF5E1E]/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Targets</span>
          </button>
        </form>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. DATA MANAGEMENT (EXPORT / IMPORT BACKUP JSON)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#111726] border border-white/[0.08] rounded-3xl p-6 shadow-xl">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
          Data Management & LocalStorage
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          All data is saved locally on this device. Back up anytime to JSON.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="p-4 rounded-2xl bg-[#0B101D] hover:bg-[#182238] border border-white/[0.06] text-left transition-all flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Export Backup JSON</div>
              <div className="text-xs text-slate-400">Download snapshot of all data</div>
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
              className="w-full p-4 rounded-2xl bg-[#0B101D] hover:bg-[#182238] border border-white/[0.06] text-left transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-[#84CC16]/15 text-[#84CC16]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Import Backup JSON</div>
                <div className="text-xs text-slate-400">Restore or load backup file</div>
              </div>
            </button>
          </div>
        </div>

        {/* Reset & Onboarding actions */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReplayOnboarding}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFA114]" />
            <span>Replay Onboarding Tour</span>
          </button>

          <button
            onClick={handleResetSeed}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default 1–2 Oct Seed</span>
          </button>
        </div>
      </section>
    </div>
  );
};
