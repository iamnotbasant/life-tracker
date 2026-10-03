'use client';

import React from 'react';
import {
  Flame,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  Settings,
  Plus,
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
  const navItems: Array<{ tab: TabType; label: string; icon: any }> = [
    { tab: 'home', label: 'Home', icon: Flame },
    { tab: 'steps', label: 'Steps', icon: Footprints },
    { tab: 'workout', label: 'Workout', icon: Dumbbell },
    { tab: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { tab: 'history', label: 'Habits', icon: CalendarDays },
  ];

  return (
    <>
      {/* Floating Minimal Quick Log Action Button */}
      <div className="fixed bottom-20 right-4 z-40 sm:right-8">
        <button
          onClick={onOpenQuickLog}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FACC15] text-black shadow-lg shadow-black/60 hover:scale-105 active:scale-95 transition-all"
          title="Quick Log"
          aria-label="Quick Log"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Docked Mobile-first Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-white/[0.06] px-2 py-2">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative',
                  isActive ? 'text-[#FACC15]' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <div className="p-1">
                  <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.2]' : 'stroke-[1.8]')} />
                </div>
                <span
                  className={cn(
                    'text-[10px] tracking-tight transition-colors',
                    isActive ? 'font-bold text-[#FACC15]' : 'font-medium text-zinc-500'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Settings / More tab */}
          <button
            onClick={() => onSelectTab('settings')}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative',
              currentTab === 'settings' || currentTab === 'calories' || currentTab === 'weight' || currentTab === 'walk'
                ? 'text-[#FACC15]'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <div className="p-1">
              <Settings className={cn('w-5 h-5', (currentTab === 'settings' || currentTab === 'calories' || currentTab === 'weight' || currentTab === 'walk') ? 'stroke-[2.2]' : 'stroke-[1.8]')} />
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight transition-colors',
                (currentTab === 'settings' || currentTab === 'calories' || currentTab === 'weight' || currentTab === 'walk') ? 'font-bold text-[#FACC15]' : 'font-medium text-zinc-500'
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
