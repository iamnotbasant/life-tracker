'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { AppState, TabType, UserProfile } from '../../lib/types';
import { exportBackupJSON, parseAndImportBackupJSON } from '../../lib/storage';
import { getInitialSeedData } from '../../lib/seed-data';
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from '../../lib/gemini';

interface SettingsViewProps {
  state: AppState;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onRestoreState: (newState: AppState) => void;
  onSelectTab: (tab: TabType) => void;
  onReplayOnboarding: () => void;
  onOpenPointsInfo: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateProfile,
  onRestoreState,
  onSelectTab,
  onReplayOnboarding,
  onOpenPointsInfo,
  onLogout,
}) => {
  const [profile, setProfile] = useState<UserProfile>({ ...state.profile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [keySaveSuccess, setKeySaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setGeminiKey(getGeminiApiKey());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(geminiKey);
    setKeySaveSuccess(true);
    setTimeout(() => setKeySaveSuccess(false), 2500);
  };

  const handleClearGeminiKey = () => {
    removeGeminiApiKey();
    setGeminiKey('');
    setKeySaveSuccess(false);
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
          CARD 3: Gemini AI Estimation API Key
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#22C55E]/15 text-[#22C55E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gemini AI Estimation</h3>
              <p className="text-[11px] text-zinc-500">1-tap calorie & macro estimates</p>
            </div>
          </div>

          {keySaveSuccess && (
            <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveGeminiKey} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Key className="w-3 h-3 text-[#22C55E]" />
              <span>Gemini API Key</span>
            </label>
            <div className="relative">
              <input
                type={isKeyVisible ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#18201C] border border-white/[0.06] rounded-xl px-3 py-2 pr-10 text-xs text-white focus:outline-none focus:border-[#22C55E] font-mono"
              />
              <button
                type="button"
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                aria-label={isKeyVisible ? 'Hide key' : 'Show key'}
              >
                {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
              Stored in your browser's localStorage only. Free API key available at{' '}
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#22C55E] hover:underline inline-flex items-center gap-0.5"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </a>
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#22C55E] text-black font-bold text-xs hover:bg-[#16A34A] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Key</span>
            </button>
            {geminiKey && (
              <button
                type="button"
                onClick={handleClearGeminiKey}
                className="py-2 px-3 rounded-xl bg-[#18201C] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/[0.06] font-semibold text-xs transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 4: Data Management (Plain Card List: Export / Import / Reset)
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

      {/* ─────────────────────────────────────────────────────────────
          CARD 5: Account & Security (Session / Log Out)
         ───────────────────────────────────────────────────────────── */}
      {onLogout && (
        <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Account & Security
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Active Session</div>
              <div className="text-[10px] text-zinc-500">Connected to Postgres backend</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
