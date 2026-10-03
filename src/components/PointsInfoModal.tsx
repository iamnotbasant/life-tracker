'use client';

import React from 'react';
import { X, Flame, CheckCircle, ShieldCheck } from 'lucide-react';
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
      accent: '#FACC15',
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
      accent: '#FACC15',
      items: [
        { label: '85g+ daily protein', pts: '+10 pts', good: true },
        { label: '65 – 84g daily protein', pts: '+5 pts', good: true },
        { label: '1 – 64g daily protein', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Daily Steps',
      accent: '#FACC15',
      items: [
        { label: '10,000+ steps hit', pts: '+10 pts', good: true },
        { label: '7,500 – 9,999 steps', pts: '+5 pts', good: true },
        { label: '5,000 – 7,499 steps', pts: '+2 pts', good: true },
        { label: '1 – 4,999 steps (Low activity)', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Workout & Calisthenics',
      accent: '#F95738',
      items: [
        { label: 'Workout 15+ min logged', pts: '+10 pts', good: true },
        { label: 'No workout logged', pts: '0 pts', neutral: true },
      ],
    },
    {
      category: 'Sleep & Discipline',
      accent: '#FACC15',
      items: [
        { label: '7.0 – 8.5 hours optimal sleep', pts: '+10 pts', good: true },
        { label: 'Asleep by 23:30 goal', pts: '+5 pts', good: true },
        { label: 'Bedtime after 00:30', pts: '-5 pts', bad: true },
        { label: 'Sleep < 6h or > 9.5h', pts: '-5 pts', bad: true },
      ],
    },
    {
      category: 'Consistency & Milestones',
      accent: '#F95738',
      items: [
        { label: 'Body weight logged today', pts: '+5 pts', good: true },
        { label: '3+ Day streak active bonus', pts: '+5 pts', good: true },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#121214] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">How Points Work</h3>
              <p className="text-xs text-zinc-400">Scoring breakdown for Basant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Minimal Points Score summary banner (NO hero image) */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FACC15]/15 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#FACC15] uppercase tracking-wider">
                Discipline Engine
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Points reward actions directly aligned with your 48.9 kg weight gain, calisthenics sessions, and circadian health.
              </p>
            </div>
          </div>

          {/* Today's Breakdown if available */}
          {day && day.pointsBreakdown && (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Today's Score Breakdown
                </span>
                <span className={`text-sm font-black ${day.points >= 0 ? 'text-[#FACC15]' : 'text-rose-400'}`}>
                  {day.points >= 0 ? `+${day.points}` : day.points} PTS
                </span>
              </div>
              <div className="space-y-1">
                {day.pointsBreakdown.notes.map((note, i) => (
                  <div key={i} className="text-xs text-zinc-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="space-y-3.5">
            {rules.map((rule, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-white/[0.05] rounded-2xl p-3.5">
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-zinc-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rule.accent }} />
                  {rule.category}
                </div>
                <div className="space-y-1.5">
                  {rule.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-black/40">
                      <span className="text-zinc-300">{it.label}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md ${
                          it.good
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : it.bad
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-zinc-800 text-zinc-400'
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
        <div className="p-4 border-t border-white/[0.06] bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
