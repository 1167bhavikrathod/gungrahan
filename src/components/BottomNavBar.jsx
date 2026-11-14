'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquareQuote, Plus, Trophy, Target } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { theme, openAddModal } = useAppContext();

  // Hide on print
  if (typeof window !== 'undefined' && pathname === '/report') {
    return null;
  }

  const navItems = [
    {
      label: 'હોમ',
      href: '/',
      icon: Home,
    },
    {
      label: 'ગુણ વાણી',
      href: '/feed',
      icon: MessageSquareQuote,
    },
    {
      label: 'લખો',
      action: () => openAddModal(null),
      isAction: true,
      icon: Plus,
    },
    {
      label: 'લીડરબોર્ડ',
      href: '/leaderboard',
      icon: Trophy,
    },
    {
      label: 'કવરેજ',
      href: '/coverage',
      icon: Target,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-amber-900/10 shadow-[0_-4px_20px_rgba(180,83,9,0.08)] px-2 pb-safe md:hidden print:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 relative">
        {navItems.map((item, idx) => {
          if (item.isAction) {
            return (
              <div key={idx} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={item.action}
                  className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-700/25 transition-transform active:scale-90 hover:scale-105 border-2 border-white ${theme.primaryGradient} focus:outline-none`}
                  aria-label="Add new guna"
                >
                  <Plus className="w-6 h-6 stroke-[2.8]" />
                </button>
                <span className="text-[10px] font-bold font-gujarati text-amber-950 mt-0.5">
                  લખો
                </span>
              </div>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-amber-950 font-bold'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-amber-100/90 text-amber-900' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-gujarati mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
