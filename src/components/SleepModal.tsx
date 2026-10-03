'use client';

import React, { useState, useEffect } from 'react';
import { Moon, X, Clock, Sparkles } from 'lucide-react';
import { SleepData } from '../lib/types';
import { calculateSleepHours, formatTime12h } from '../lib/utils';

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepData?: SleepData;
  dateLabel: string;
  onSaveSleep: (sleep: SleepData) => void;
  onClearSleep: () => void;
}

export const SleepModal: React.FC<SleepModalProps> = ({
  isOpen,
  onClose,
  sleepData,
  dateLabel,
  onSaveSleep,
  onClearSleep,
}) => {
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSleepStart(sleepData?.sleepStart || '');
      setSleepEnd(sleepData?.sleepEnd || '');
    }
  }, [isOpen, sleepData]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasExistingSleep = Boolean(
    sleepData && (sleepData.sleepHours !== undefined || sleepData.sleepStart || sleepData.sleepEnd)
  );

  const previewHours =
    sleepStart && sleepEnd ? calculateSleepHours(sleepStart, sleepEnd) : null;

  // Bedtime bonus check (asleep by 23:30)
  const isBedtimeGood = () => {
    if (!sleepStart) return false;
    const [h, m] = sleepStart.split(':').map(Number);
    return h >= 20 && (h < 23 || (h === 23 && m <= 30));
  };

  // Duration bonus check (7.0 - 8.5 hours)
  const isDurationGood = () => {
    if (previewHours === null) return false;
    return previewHours >= 7 && previewHours <= 8.5;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepStart || !sleepEnd) return;
    const hours = calculateSleepHours(sleepStart, sleepEnd);
    onSaveSleep({
      sleepStart,
      sleepEnd,
      sleepHours: hours,
    });
    onClose();
  };

  const handleClear = () => {
    onClearSleep();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#121815] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#18201C]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#22C55E]/15 text-[#22C55E]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Log Sleep</h3>
              <p className="text-xs text-zinc-400">{dateLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Bedtime</span>
              </label>
              <input
                type="time"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
                required
                className="w-full bg-[#18201C] border border-white/[0.08] focus:border-[#22C55E] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none transition-colors [color-scheme:dark]"
              />
              {sleepStart && (
                <span className="block text-[11px] text-zinc-500 mt-1 pl-1">
                  {formatTime12h(sleepStart)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Wake Time</span>
              </label>
              <input
                type="time"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
                required
                className="w-full bg-[#18201C] border border-white/[0.08] focus:border-[#22C55E] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none transition-colors [color-scheme:dark]"
              />
              {sleepEnd && (
                <span className="block text-[11px] text-zinc-500 mt-1 pl-1">
                  {formatTime12h(sleepEnd)}
                </span>
              )}
            </div>
          </div>

          {/* Duration Preview Card */}
          {previewHours !== null ? (
            <div className="p-4 rounded-xl bg-[#18201C] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Total Sleep</span>
                <span className="text-lg font-black text-[#22C55E] tracking-tight">
                  {previewHours}h
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                <span>Schedule:</span>
                <span className="font-medium text-zinc-300">
                  {formatTime12h(sleepStart)} → {formatTime12h(sleepEnd)}
                </span>
              </div>

              {/* Bonus hints */}
              <div className="pt-1.5 flex flex-wrap gap-1.5">
                {isDurationGood() ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    +10 pts optimal 7–8.5h
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500">
                    Goal: 7.0–8.5 hours
                  </span>
                )}
                {isBedtimeGood() && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    +5 pts before 23:30
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#18201C]/60 border border-white/[0.04] text-xs text-zinc-500 text-center">
              Enter bedtime and wake time to compute duration
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={!sleepStart || !sleepEnd}
              className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
            >
              Save Sleep
            </button>

            {hasExistingSleep && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-2.5 rounded-xl bg-[#18201C] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/[0.06] font-semibold text-xs transition-all"
              >
                Clear Sleep Log
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
