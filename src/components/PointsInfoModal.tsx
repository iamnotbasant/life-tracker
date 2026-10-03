'use client';

import React from 'react';
import Image from 'next/image';
import { X, Flame, CheckCircle, AlertTriangle, Trophy, Zap, ShieldCheck } from 'lucide-react';
import { DayData, PointsBreakdown, UserProfile } from '../lib/types';

interface PointsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  day?: DayData;
  profile: UserProfile;
}

export const PointsInfoModal: React.FC<PointsInfoModalProps> = ({
  isOpen,
  onClose,
  day,
  profile,
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      category: 'Nutrition & Calories',
      accent: '#84CC16',
      items: [
        { label: '2,400 – 2,650 kcal (Gain Target)', pts: '+10 pts', good: true },
        { label: '2,200 – 2,399 kcal (Maintain)', pts: '+5 pts', good: true },
        { label: '2,000 – 2,199 kcal (Slight deficit)', pts: '0 pts', neutral: true },
        { label: '1 – 1,999 kcal (Under-eating)', pts: '-8 pts', bad: true },
        { label: '2,900+ kcal (Excessive surplus)', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Protein Target',
      accent: '#38BDF8',
      items: [
        { label: '85g+ daily protein', pts: '+10 pts', good: true },
        { label: '65 – 84g daily protein', pts: '+5 pts', good: true },
        { label: '1 – 64g daily protein', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Daily Steps',
      accent: '#10B981',
      items: [
        { label: '10,000+ steps hit', pts: '+10 pts', good: true },
        { label: '7,500 – 9,999 steps', pts: '+5 pts', good: true },
        { label: '5,000 – 7,499 steps', pts: '+2 pts', good: true },
        { label: '1 – 4,999 steps (Low activity)', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Workout & Calisthenics',
      accent: '#06B6D4',
      items: [
        { label: 'Workout 15+ min logged', pts: '+10 pts', good: true },
        { label: 'No workout logged', pts: '0 pts', neutral: true },
      ],
    },
    {
      category: 'Sleep & Discipline',
      accent: '#A855F7',
      items: [
        { label: '7.0 – 8.5 hours optimal sleep', pts: '+10 pts', good: true },
        { label: 'Asleep by 23:30 goal', pts: '+5 pts', good: true },
        { label: 'Bedtime after 00:30', pts: '-5 pts', bad: true },
        { label: 'Sleep < 6h or > 9.5h', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Consistency & Milestones',
      accent: '#F43F5E',
      items: [
        { label: 'Body weight logged today', pts: '+5 pts', good: true },
        { label: '3+ Day streak active bonus', pts: '+5 pts', good: true },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0E1424] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#12192D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF5E1E]/20 text-[#FF5E1E]">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">How Points Work</h3>
              <p className="text-xs text-slate-400">Scoring system for Basant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Hero Banner inside modal */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#18233C] to-[#121A2C] border border-white/10 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <Image
                src="/assets/hero-points-flame.png"
                alt="Points flame"
                fill
                className="object-contain"
                sizes="56px"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#FF8800] uppercase tracking-wider">
                Consistency Engine
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Points reward actions directly aligned with your 48.9 kg weight gain journey, calisthenics consistency, and circadian health.
              </p>
            </div>
          </div>

          {/* Today's Breakdown if available */}
          {day && day.pointsBreakdown && (
            <div className="p-4 rounded-2xl bg-[#141C30] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Today's Score Breakdown
                </span>
                <span className={`text-sm font-black ${day.points >= 0 ? 'text-[#FF8800]' : 'text-rose-400'}`}>
                  {day.points >= 0 ? `+${day.points}` : day.points} PTS
                </span>
              </div>
              <div className="space-y-1">
                {day.pointsBreakdown.notes.map((note, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="bg-[#111728] border border-white/[0.06] rounded-2xl p-3.5">
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                  style={{ color: rule.accent }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rule.accent }} />
                  {rule.category}
                </div>
                <div className="space-y-1.5">
                  {rule.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-black/20">
                      <span className="text-slate-300">{it.label}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md ${
                          it.good
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : it.bad
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-700/30 text-slate-400'
                        }`}
                      >
                        {it.pts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#12192D] flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-sm transition-colors"
          >
            Got it, Let's Track!
          </button>
        </div>
      </div>
    </div>
  );
};
