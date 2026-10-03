'use client';

import React from 'react';
import { ArrowLeft, Moon, Plus, Clock, Sparkles } from 'lucide-react';
import { AppState, SleepData } from '../../lib/types';
import { formatDateLabel, formatTime12h, calculateSleepHours, cn } from '../../lib/utils';
import { DateNavigator } from '../DateNavigator';

interface SleepViewProps {
  state: AppState;
  onBack: () => void;
  onOpenQuickLog?: (tab: 'sleep') => void;
  onOpenSleepModal?: () => void;
  onDateChange?: (newDate: string) => void;
}

export const SleepView: React.FC<SleepViewProps> = ({
  state,
  onBack,
  onOpenQuickLog,
  onOpenSleepModal,
  onDateChange,
}) => {
  const { days, activeDate, profile } = state;

  // Collect all days with logged sleep
  const loggedSleepDays = Object.values(days)
    .filter(
      (d) =>
        d.sleep &&
        (d.sleep.sleepHours !== undefined || (d.sleep.sleepStart && d.sleep.sleepEnd))
    )
    .map((d) => {
      const s = d.sleep as SleepData;
      const hours =
        s.sleepHours !== undefined
          ? s.sleepHours
          : s.sleepStart && s.sleepEnd
          ? calculateSleepHours(s.sleepStart, s.sleepEnd)
          : 0;

      // Bedtime check
      let bedtimeGood: boolean | null = null;
      if (s.sleepStart) {
        const [h, m] = s.sleepStart.split(':').map(Number);
        if (h >= 20 && (h < 23 || (h === 23 && m <= 30))) {
          bedtimeGood = true;
        } else if (h >= 0 && (h > 0 || m > 30) && h < 6) {
          bedtimeGood = false;
        }
      }

      const durationGood = hours >= 7 && hours <= 8.5;

      return {
        date: d.date,
        sleepStart: s.sleepStart,
        sleepEnd: s.sleepEnd,
        hours,
        bedtimeGood,
        durationGood,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

  const totalLogged = loggedSleepDays.length;
  const avgHours =
    totalLogged > 0
      ? +(
          loggedSleepDays.reduce((sum, d) => sum + d.hours, 0) / totalLogged
        ).toFixed(1)
      : 0;

  const handleOpenLog = () => {
    if (onOpenSleepModal) {
      onOpenSleepModal();
    } else if (onOpenQuickLog) {
      onOpenQuickLog('sleep');
    }
  };

  // Chronological for the mini visual
  const chronological = [...loggedSleepDays].reverse();
  const maxHours = Math.max(9, ...chronological.map((d) => d.hours));

  return (
    <div className="space-y-3 pb-28 max-w-md mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          SCREEN HEADER: Back button + Title + Quick Log (+) button
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Sleep</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Day-wise history & schedule</p>
          </div>
        </div>

        <button
          onClick={handleOpenLog}
          className="w-10 h-10 rounded-full bg-[#121815] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center hover:border-[#22C55E] active:scale-95 transition-all shadow-md"
          title="Log Sleep"
          aria-label="Log Sleep"
        >
          <Plus className="w-5 h-5 text-[#22C55E]" />
        </button>
      </div>

      {/* Date Navigator */}
      <DateNavigator currentDate={activeDate} onDateChange={onDateChange} />

      {/* ─────────────────────────────────────────────────────────────
          CARD 1: Summary Card (Average / Goal)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Sleep Overview</span>
          <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-lg">
            Goal 7.0–8.5h
          </span>
        </div>
        <div className="text-5xl font-black text-white tracking-tight my-2">
          {avgHours > 0 ? avgHours : '—'} <span className="text-2xl font-normal text-zinc-500">h avg</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium">
          {totalLogged} night{totalLogged !== 1 ? 's' : ''} logged • Target bedtime {profile.bedtimeGoal || '23:30'}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: Trend Visual (Bars of history)
         ───────────────────────────────────────────────────────────── */}
      {chronological.length > 0 && (
        <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Sleep Duration Trend</span>
            <span className="text-[11px] text-zinc-500">{totalLogged} entries</span>
          </div>

          <div className="flex items-end gap-2 h-24 bg-[#0E1411] p-3 rounded-xl border border-white/[0.04]">
            {chronological.map((d) => {
              const heightPercent = Math.min(Math.max(Math.round((d.hours / maxHours) * 100), 15), 100);
              const isOptimal = d.hours >= 7 && d.hours <= 8.5;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <div className="text-[10px] font-bold text-zinc-300">{d.hours}h</div>
                  <div
                    className={cn(
                      'w-full rounded-md transition-all duration-300',
                      isOptimal
                        ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                        : d.hours >= 6
                        ? 'bg-[#22C55E]/60'
                        : 'bg-zinc-600'
                    )}
                    style={{ height: `${heightPercent}%` }}
                    title={`${d.date}: ${d.hours}h`}
                  />
                  <span className="text-[9px] text-zinc-500 font-mono truncate w-full text-center">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DAY-WISE HISTORY LIST: newest first
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold text-zinc-400 px-1 flex items-center justify-between">
          <span>Day-Wise History</span>
          <span className="text-[11px] text-zinc-500">Newest first</span>
        </div>

        {loggedSleepDays.length === 0 ? (
          <div className="bg-[#121815] border border-white/[0.05] rounded-2xl p-8 text-center flex flex-col items-center">
            <Moon className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No sleep logged yet</p>
          </div>
        ) : (
          loggedSleepDays.map((entry) => (
            <div
              key={entry.date}
              className="p-4 rounded-2xl bg-[#121815] border border-white/[0.05] flex items-center justify-between gap-3 shadow-sm hover:border-white/10 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{formatDateLabel(entry.date)}</span>
                  {entry.date === activeDate && (
                    <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.2 rounded">
                      Selected
                    </span>
                  )}
                </div>

                {entry.sleepStart && entry.sleepEnd ? (
                  <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span>
                      {formatTime12h(entry.sleepStart)} → {formatTime12h(entry.sleepEnd)}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 mt-0.5">Duration only</div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {entry.durationGood ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      +10 pts optimal
                    </span>
                  ) : entry.hours >= 6 ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-zinc-300 border border-white/[0.06]">
                      +5 pts
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      -5 pts short
                    </span>
                  )}

                  {entry.bedtimeGood === true && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                      +5 pts bedtime
                    </span>
                  )}
                  {entry.bedtimeGood === false && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      -5 pts late bedtime
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-white tracking-tight">
                  {entry.hours} <span className="text-xs font-normal text-zinc-500">hours</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
