'use client';

import React, { useState, useEffect } from 'react';
import { Scale, X } from 'lucide-react';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight?: number;
  dateLabel: string;
  onSaveWeight: (weight: number) => void;
  onClearWeight: () => void;
}

export const WeightModal: React.FC<WeightModalProps> = ({
  isOpen,
  onClose,
  currentWeight,
  dateLabel,
  onSaveWeight,
  onClearWeight,
}) => {
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWeightInput(currentWeight !== undefined && currentWeight > 0 ? String(currentWeight) : '');
    }
  }, [isOpen, currentWeight]);

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

  const hasExistingWeight = currentWeight !== undefined && currentWeight > 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      onSaveWeight(Number(val.toFixed(1)));
      onClose();
    }
  };

  const handleClear = () => {
    onClearWeight();
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
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Log Weight</h3>
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
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Body Weight (1 decimal)</span>
              <span className="text-[11px] text-zinc-500">kg</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="e.g. 48.9"
                required
                autoFocus
                className="w-full bg-[#18201C] border border-white/[0.08] focus:border-[#22C55E] rounded-xl px-4 py-3 text-lg text-white font-bold focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                kg
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5 pl-1">
              Morning empty-stomach weigh-in recommended
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={!weightInput || isNaN(parseFloat(weightInput)) || parseFloat(weightInput) <= 0}
              className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm transition-all shadow-md active:scale-[0.99]"
            >
              Save Weight
            </button>

            {hasExistingWeight && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-2.5 rounded-xl bg-[#18201C] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/[0.06] font-semibold text-xs transition-all"
              >
                Clear Weight Log
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
