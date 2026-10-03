'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDateLabel, cn } from '../lib/utils';

export interface DateNavigatorProps {
  currentDate: string;
  onDateChange?: (newDate: string) => void;
  className?: string;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  onDateChange,
  className,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handlePrevDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onDateChange) return;
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleOpenDatePicker = () => {
    if (!dateInputRef.current) return;
    try {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
        return;
      }
    } catch {}
    dateInputRef.current.focus();
  };

  const isToday = currentDate === '2026-10-03' || currentDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? `Today, ${formatDateLabel(currentDate)}` : formatDateLabel(currentDate);

  return (
    <div className={cn("flex items-center gap-2 pt-1 pb-1", className)}>
      <button
        type="button"
        onClick={handlePrevDay}
        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 hover:text-white text-zinc-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative flex-1">
        <button
          type="button"
          onClick={handleOpenDatePicker}
          className="w-full h-12 min-h-[48px] px-4 rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm text-center group"
          aria-label="Select date"
        >
          <Calendar className="w-4 h-4 text-[#22C55E]/80 group-hover:text-[#22C55E] transition-colors shrink-0" />
          <span className="text-sm font-semibold text-white tracking-wide">
            {dateLabel}
          </span>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={currentDate}
          onChange={(e) => {
            if (e.target.value && onDateChange) {
              onDateChange(e.target.value);
            }
          }}
          className="sr-only"
          tabIndex={-1}
          aria-label="Select date"
        />
      </div>

      <button
        type="button"
        onClick={handleNextDay}
        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-[#121815] border border-white/[0.05] hover:border-[#22C55E]/40 hover:text-white text-zinc-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
