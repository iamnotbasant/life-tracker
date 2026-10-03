'use client';

import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';

interface HeatmapDay {
  date: string; // YYYY-MM-DD
  value: number; // count, kcal, steps, etc.
  completed: boolean;
  label?: string;
}

interface YearlyHeatmapProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor: string; // e.g. '#10B981', '#FF5E1E', '#06B6D4'
  data: Record<string, HeatmapDay>;
  currentDate?: string;
  streakCount?: number;
  totalDaysCount?: number;
  unitLabel?: string;
  targetThreshold?: number;
  actionBadge?: React.ReactNode;
}

export const YearlyHeatmap: React.FC<YearlyHeatmapProps> = ({
  title,
  subtitle,
  icon,
  accentColor,
  data,
  currentDate = '2026-10-03',
  streakCount = 0,
  totalDaysCount = 0,
  unitLabel = 'completed',
  targetThreshold = 1,
  actionBadge,
}) => {
  // Generate 52 weeks (364 days) leading up to the end of the year or current date
  const { weeks, monthLabels } = useMemo(() => {
    const end = new Date(currentDate);
    // Align end to Saturday of current week to make neat 7-row columns
    const dayOfWeek = end.getDay(); // 0 is Sun, 6 is Sat
    const daysToAddToSaturday = (6 - dayOfWeek + 7) % 7;
    const calendarEnd = new Date(end);
    calendarEnd.setDate(calendarEnd.getDate() + daysToAddToSaturday);

    const totalWeeks = 40; // show last ~9-10 months for crisp mobile scroll
    const totalDays = totalWeeks * 7;
    const calendarStart = new Date(calendarEnd);
    calendarStart.setDate(calendarStart.getDate() - totalDays + 1);

    const weeksArr: HeatmapDay[][] = [];
    const monthsArr: { label: string; weekIndex: number }[] = [];
    let currentWeek: HeatmapDay[] = [];
    let lastMonth = -1;

    let curr = new Date(calendarStart);
    let weekIdx = 0;

    for (let i = 0; i < totalDays; i++) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Check month boundary
      const monthNum = curr.getMonth();
      if (monthNum !== lastMonth) {
        monthsArr.push({
          label: curr.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weekIdx,
        });
        lastMonth = monthNum;
      }

      const dayRecord = data[dateStr];
      currentWeek.push({
        date: dateStr,
        value: dayRecord?.value || 0,
        completed: dayRecord ? (dayRecord.completed ?? dayRecord.value >= targetThreshold) : false,
        label: dayRecord?.label,
      });

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      curr.setDate(curr.getDate() + 1);
    }

    return { weeks: weeksArr, monthLabels: monthsArr };
  }, [data, currentDate, targetThreshold]);

  // Color intensity helper
  const getCellBackground = (day: HeatmapDay) => {
    if (!day.completed && day.value === 0) {
      return '#141C2E'; // dim inactive dot
    }

    // Intensity ratio
    const ratio = targetThreshold > 0 ? Math.min(day.value / targetThreshold, 1.5) : 1;

    if (ratio >= 1) {
      return accentColor;
    } else if (ratio >= 0.6) {
      return `${accentColor}B3`; // ~70% opacity
    } else if (ratio >= 0.3) {
      return `${accentColor}70`; // ~45% opacity
    } else {
      return `${accentColor}40`; // ~25% opacity
    }
  };

  return (
    <div className="bg-[#101626] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all hover:border-white/15">
      {/* Card Header (ref-04 style) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div
              className="p-2 rounded-xl text-white shrink-0"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              {icon}
            </div>
          )}
          <div className="truncate">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate flex items-center gap-2">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Stats & Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {streakCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-[#FF8800] bg-[#FF5E1E]/10 border border-[#FF5E1E]/20 px-2 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streakCount}</span>
            </div>
          )}

          {totalDaysCount > 0 && (
            <div className="text-xs font-semibold text-slate-300 bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-lg">
              {totalDaysCount}d
            </div>
          )}

          {actionBadge}
        </div>
      </div>

      {/* Month Labels Bar */}
      <div className="relative overflow-x-auto no-scrollbar pt-1">
        <div className="min-w-[620px]">
          {/* Months header */}
          <div className="flex text-[10px] font-semibold text-slate-400 mb-1.5 h-4 relative">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${(m.weekIndex / weeks.length) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Heatmap Grid (7 rows, N columns) */}
          <div className="flex gap-[4px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[4px]">
                {week.map((day) => {
                  const isCurrent = day.date === currentDate;
                  const bg = getCellBackground(day);
                  const isFilled = day.completed || day.value > 0;

                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.value} ${unitLabel}`}
                      style={{
                        backgroundColor: bg,
                        boxShadow: isFilled ? `0 0 6px ${accentColor}40` : undefined,
                      }}
                      className={`w-[11px] h-[11px] rounded-[3px] transition-all hover:scale-125 hover:z-10 cursor-pointer ${
                        isCurrent ? 'ring-1.5 ring-white' : ''
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Weekday indicators on bottom / subtle footer */}
          <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#141C2E]" />
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: `${accentColor}40` }} />
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: `${accentColor}80` }} />
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: accentColor }} />
              <span>More</span>
            </span>
            <span>365-day tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
