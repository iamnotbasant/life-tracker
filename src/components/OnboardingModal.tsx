'use client';

import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121815] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col p-6 text-center">
        {/* Minimal Welcome Typography - ZERO illustrations */}
        <div className="space-y-2 mb-6 pt-2">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-full mb-1">
            Focus & Discipline
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Life Tracker
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
            Clean daily metrics. Track calisthenics, 2,500 kcal surplus, 10k steps, and daily points.
          </p>
        </div>

        {/* 3 Minimal Pillars */}
        <div className="space-y-2.5 mb-6 text-left bg-[#18201C] p-4 rounded-xl border border-white/[0.04]">
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span>2,500 kcal gain goal & 85g+ protein</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span>Daily 10,000 steps & calisthenics</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span>Honest daily discipline scoring</span>
          </div>
        </div>

        {/* Single CTA Button */}
        <button
          onClick={onComplete}
          className="w-full py-3.5 px-6 rounded-xl bg-[#22C55E] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#16A34A] active:scale-[0.98] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
