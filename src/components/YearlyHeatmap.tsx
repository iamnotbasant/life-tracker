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
  accentColor?: string; // default #22C55E
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
  accentColor = '#22C55E',
  data,
  currentDate = '2026-10-03',
  streakCount = 0,
  totalDaysCount = 0,
  unitLabel = 'completed',
  targetThreshold = 1,
  actionBadge,
}) => {
  // Generate 36 weeks leading up to calendar end
  const { weeks, monthLabels } = useMemo(() => {
    const end = new Date(currentDate);
    const dayOfWeek = end.getDay();
    const daysToAddToSaturday = (6 - dayOfWeek + 7) % 7;
    const calendarEnd = new Date(end);
    calendarEnd.setDate(calendarEnd.getDate() + daysToAddToSaturday);

    const totalWeeks = 36;
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

  // Color intensity helper (green Github style)
  const getCellBackground = (day: HeatmapDay) => {
    if (!day.completed && day.value === 0) {
      return '#18201C'; // subtle dark groove
    }

    const ratio = targetThreshold > 0 ? Math.min(day.value / targetThreshold, 1.5) : 1;

    if (ratio >= 1) {
      return '#22C55E';
    } else if (ratio >= 0.6) {
      return '#22C55ECC';
    } else if (ratio >= 0.3) {
      return '#22C55E75';
    } else {
      return '#22C55E35';
    }
  };

  return (
    <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-[#18201C] border border-white/[0.04] flex items-center justify-center shrink-0 text-[#22C55E]">
              {icon}
            </div>
          )}
          <div className="truncate">
            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-zinc-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Stats & Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {streakCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-lg">
              <Flame className="w-3.5 h-3.5" />
              <span>{streakCount}</span>
            </div>
          )}

          {totalDaysCount > 0 && (
            <div className="text-xs font-semibold text-zinc-300 bg-[#18201C] border border-white/[0.06] px-2 py-0.5 rounded-lg">
              {totalDaysCount}d
            </div>
          )}

          {actionBadge}
        </div>
      </div>

      {/* 3 Stat Tiles */}
      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="bg-[#18201C] p-2.5 rounded-xl border border-white/[0.04] text-center">
          <div className="text-sm font-bold text-white">{totalDaysCount} days</div>
          <div className="text-[10px] text-zinc-400 uppercase font-medium">Finished</div>
        </div>
        <div className="bg-[#18201C] p-2.5 rounded-xl border border-white/[0.04] text-center">
          <div className="text-sm font-bold text-[#22C55E]">
            {Math.round((totalDaysCount / 365) * 100)}%
          </div>
          <div className="text-[10px] text-zinc-400 uppercase font-medium">Year Track</div>
        </div>
        <div className="bg-[#18201C] p-2.5 rounded-xl border border-white/[0.04] text-center">
          <div className="text-sm font-bold text-white">
            {data[currentDate]?.value || 0}
          </div>
          <div className="text-[10px] text-zinc-400 uppercase font-medium truncate">{unitLabel}</div>
        </div>
      </div>

      {/* Month Labels & Grid Container */}
      <div className="relative overflow-x-auto no-scrollbar pt-1">
        <div className="min-w-[540px]">
          {/* Months header */}
          <div className="flex text-[10px] font-semibold text-zinc-500 mb-1.5 h-4 relative">
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
          <div className="flex gap-[3.5px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3.5px]">
                {week.map((day) => {
                  const isCurrent = day.date === currentDate;
                  const bg = getCellBackground(day);

                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.value} ${unitLabel}`}
                      style={{
                        backgroundColor: bg,
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

          {/* Weekday indicators & legend */}
          <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#18201C]" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#22C55E]/20" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#22C55E]/50" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#22C55E]" />
              <span>More</span>
            </span>
            <span>365-day consistency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
