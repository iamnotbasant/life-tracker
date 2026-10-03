'use client';

import React from 'react';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  Settings,
  FlameKindling,
  Scale,
  Zap,
} from 'lucide-react';
import { TabType } from '../lib/types';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickLog,
}) => {
  const navItems: Array<{ tab: TabType; label: string; icon: any; color: string }> = [
    { tab: 'home', label: 'Home', icon: Flame, color: '#FF5E1E' },
    { tab: 'steps', label: 'Steps', icon: Footprints, color: '#10B981' },
    { tab: 'workout', label: 'Workouts', icon: Dumbbell, color: '#06B6D4' },
    { tab: 'meals', label: 'Meals', icon: UtensilsCrossed, color: '#84CC16' },
    { tab: 'history', label: 'Heatmaps', icon: CalendarDays, color: '#8B5CF6' },
  ];

  return (
    <>
      {/* Floating Center Quick Log Action Button */}
      <div className="fixed bottom-20 right-4 z-40 sm:right-8">
        <button
          onClick={onOpenQuickLog}
          className="group relative flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF5E1E] to-[#FFA114] text-white shadow-lg shadow-[#FF5E1E]/30 hover:scale-105 active:scale-95 transition-all"
          title="Quick Log"
        >
          <span className="text-2xl font-bold leading-none">+</span>
          <span className="absolute -top-8 bg-[#111726] border border-white/10 text-[10px] text-white font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            Quick Log
          </span>
        </button>
      </div>

      {/* Docked Mobile-first Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070A11]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-1.5 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={cn(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative',
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {isActive && (
                  <span
                    className="absolute -top-1.5 w-8 h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-all',
                    isActive ? 'bg-white/[0.08]' : ''
                  )}
                  style={isActive ? { color: item.color } : {}}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-tight transition-colors',
                    isActive ? 'font-bold' : ''
                  )}
                  style={isActive ? { color: item.color } : {}}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Quick more / secondary tabs icon (settings, weight, calories, walk) */}
          <button
            onClick={() => onSelectTab('settings')}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative',
              currentTab === 'settings' || currentTab === 'calories' || currentTab === 'weight' || currentTab === 'walk'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {(currentTab === 'settings' || currentTab === 'calories' || currentTab === 'weight' || currentTab === 'walk') && (
              <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-[#38BDF8]" />
            )}
            <div className="p-1.5 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
