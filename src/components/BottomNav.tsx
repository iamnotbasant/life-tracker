'use client';

import React from 'react';
import {
  LayoutGrid,
  Footprints,
  Dumbbell,
  UtensilsCrossed,
  Moon,
} from 'lucide-react';
import { TabType } from '../lib/types';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickLog?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems: Array<{ tab: TabType; label: string; icon: any }> = [
    { tab: 'home', label: 'Home', icon: LayoutGrid },
    { tab: 'steps', label: 'Steps', icon: Footprints },
    { tab: 'workout', label: 'Workouts', icon: Dumbbell },
    { tab: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { tab: 'sleep', label: 'Sleep', icon: Moon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F0D]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
                isActive ? 'text-[#22C55E]' : 'text-zinc-500 hover:text-zinc-300'
              )}
              title={item.label}
              aria-label={item.label}
            >
              <div className="p-1">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-150',
                    isActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-tight transition-colors',
                  isActive ? 'font-bold text-[#22C55E]' : 'font-medium text-zinc-500'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
