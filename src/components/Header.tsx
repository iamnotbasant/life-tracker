'use client';

import React from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const initial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'B';

  return (
    <header className="sticky top-0 z-30 bg-[#0A0F0D]/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div 
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-9 h-9 rounded-full bg-[#121815] border border-white/[0.08] text-white font-bold text-sm flex items-center justify-center group-hover:border-[#22C55E] transition-colors shrink-0">
            {initial}
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-400">
              {isToday ? 'Today' : 'Date'}
            </div>
            <div className="text-sm font-bold text-white tracking-tight leading-tight group-hover:text-[#22C55E] transition-colors">
              {formatDateLabel(activeDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPointsInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121815] hover:bg-[#18201C] border border-white/[0.08] text-xs font-semibold text-white transition-all active:scale-95"
            title="View Points & Streak Rules"
          >
            <Flame className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{streak}d</span>
            <span className="text-zinc-600">•</span>
            <span className={todayPoints >= 0 ? "text-[#22C55E]" : "text-rose-400"}>
              {todayPoints >= 0 ? `+${todayPoints}` : todayPoints}
            </span>
          </button>

          <div className="flex items-center bg-[#121815] border border-white/[0.08] rounded-xl p-0.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white/[0.08] rounded-lg text-zinc-400 hover:text-white transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleTodayClick}
              className="px-2 py-1 text-xs font-medium text-zinc-300 hover:text-white"
            >
              {isToday ? 'Today' : 'Jump'}
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white/[0.08] rounded-lg text-zinc-400 hover:text-white transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
