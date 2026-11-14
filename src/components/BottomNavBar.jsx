'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquareQuote, Plus, Trophy, Target } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { theme, openAddModal, currentUser } = useAppContext();

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-2 pb-safe print:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item, idx) => {
          if (item.isAction) {
            return (
              <button
                key={idx}
                onClick={item.action}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
                aria-label="Add new guna"
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform active:scale-90 group-hover:scale-105 p-3.5 ${theme.primaryGradient}`}
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold font-gujarati text-slate-700 mt-0.5">
                  + લખો
                </span>
              </button>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? theme.primaryAccentText + ' font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-lg transition ${isActive ? theme.primarySoftBg : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] font-gujarati mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
