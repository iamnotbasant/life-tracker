'use client';

import React from 'react';
import Image from 'next/image';
import { Flame, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { TabType, UserProfile } from '../lib/types';
import { formatDateLabel } from '../lib/utils';

interface HeaderProps {
  profile: UserProfile;
  activeDate: string;
  onDateChange: (newDate: string) => void;
  streak: number;
  todayPoints: number;
  onOpenPointsInfo: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeDate,
  onDateChange,
  streak,
  todayPoints,
  onOpenPointsInfo,
  onSelectTab,
}) => {
  const isToday = activeDate === new Date().toISOString().split('T')[0] || activeDate === '2026-10-03';

  const handlePrevDay = () => {
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const prevStr = date.toISOString().split('T')[0];
    onDateChange(prevStr);
  };

  const handleNextDay = () => {
    const [y, m, d] = activeDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const nextStr = date.toISOString().split('T')[0];
    onDateChange(nextStr);
  };

  const handleTodayClick = () => {
    onDateChange('2026-10-03');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#070A11]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Profile Avatar & Greeting */}
        <div 
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#FF5E1E]/40 group-hover:ring-[#FF5E1E] transition-all bg-[#121826]">
            <Image
              src="/assets/avatar-basant.png"
              alt={profile.name}
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Welcome back</div>
            <div className="text-base font-bold text-white tracking-tight leading-none group-hover:text-[#FF5E1E] transition-colors">
              {profile.name}
            </div>
          </div>
        </div>

        {/* Date Selector & Streak */}
        <div className="flex items-center gap-2">
          {/* Points/Streak Pill */}
          <button
            onClick={onOpenPointsInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182035] hover:bg-[#1E2945] border border-white/[0.08] text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
            title="View Points & Streak Rules"
          >
            <Flame className="w-4 h-4 text-[#FF5E1E] animate-pulse" />
            <span>{streak}d</span>
            <span className="text-slate-500">•</span>
            <span className={todayPoints >= 0 ? "text-[#FF8800]" : "text-rose-400"}>
              {todayPoints >= 0 ? `+${todayPoints}` : todayPoints}
            </span>
          </button>

          {/* Quick Date Switcher */}
          <div className="flex items-center bg-[#111726] border border-white/[0.08] rounded-xl p-0.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleTodayClick}
              className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white"
            >
              {isToday ? 'Today' : formatDateLabel(activeDate)}
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
