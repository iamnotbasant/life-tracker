'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121214] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 text-center">
        {/* Simplified Welcome Hero Visual (v2 asset) */}
        <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-2xl overflow-hidden mb-6 border border-white/[0.06] bg-black">
          <Image
            src="/assets/welcome-hero.png"
            alt="Life Tracker geometric focus"
            fill
            className="object-cover"
            sizes="220px"
            priority
          />
        </div>

        {/* Minimal Welcome Typography */}
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Life Tracker
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
            Discipline & progression in clean focus. Track calisthenics, 2,500 kcal surplus, 10k steps, and daily points.
          </p>
        </div>

        {/* 3 Minimal Pillars */}
        <div className="space-y-2 mb-6 text-left bg-zinc-900/40 p-3.5 rounded-2xl border border-white/[0.04]">
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>2,500 kcal gain goal & 85g+ protein</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>Daily 10k steps & calisthenics sessions</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>Automated daily discipline scoring</span>
          </div>
        </div>

        {/* Single CTA Button */}
        <button
          onClick={onComplete}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#FACC15] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FDE047] active:scale-[0.98] transition-all shadow-md shadow-amber-500/10"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
