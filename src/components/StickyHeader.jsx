'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  FileText,
  LogOut,
  ChevronDown,
  Award,
  Users,
  Home,
  MessageSquareQuote,
  Trophy,
  Target,
} from 'lucide-react';
import { getFirstGrapheme } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

export default function StickyHeader() {
  const pathname = usePathname();
  const {
    currentUser,
    myWriterBadge,
    myWrittenCount,
    myCoverageStats,
    theme,
    logoutUser,
  } = useAppContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = getFirstGrapheme(currentUser?.name || '');

  const navLinks = [
    { label: 'હોમ', href: '/', icon: Home },
    { label: 'ગુણ વાણી', href: '/feed', icon: MessageSquareQuote },
    { label: 'લીડરબોર્ડ', href: '/leaderboard', icon: Trophy },
    { label: 'કવરેજ', href: '/coverage', icon: Target },
    { label: 'બાપાનો પત્ર', href: '/report', icon: FileText },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-colors ${theme.headerBg}`}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Block */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
              theme.isBal ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                ગુણગ્રહણ એપ
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${theme.primarySoftBg}`}>
                {theme.wingLabelGujarati}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-gujarati -mt-0.5">
              રમતોત્સવ ગુણ મહોત્સવ
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-gujarati font-semibold transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? theme.primaryAccentText : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Cluster */}
        {currentUser && (
          <div className="relative shrink-0" ref={menuRef}>
            <div className="flex items-center gap-2">
              {/* Writer Milestone Pill Badge */}
              <div
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition ${myWriterBadge.colorClass}`}
                title={`તમારું લેખક પદવી: ${myWriterBadge.title}`}
              >
                <span>{myWriterBadge.icon}</span>
                <span className="font-gujarati">{myWriterBadge.title}</span>
              </div>

              {/* Avatar Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-1.5 p-1 rounded-full hover:ring-2 ${theme.ringFocus} transition focus:outline-none`}
                aria-label="User profile menu"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${theme.avatarBadge}`}
                >
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Profile Popover Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">લોગિન કરેલ કાર્યકર</p>
                  <p className="text-sm font-bold text-slate-800 truncate font-gujarati mt-0.5">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${myWriterBadge.colorClass}`}>
                      {myWriterBadge.icon} {myWriterBadge.title}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({myWrittenCount} ગુણ)
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-xs text-slate-600 space-y-1 font-gujarati">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      તમે લખેલા ગુણ:
                    </span>
                    <span className="font-bold text-slate-800">{myWrittenCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      કાર્યકર કવરેજ:
                    </span>
                    <span className="font-bold text-slate-800">
                      🎯 {myCoverageStats.coveredCount}/{myCoverageStats.totalOthers}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-sm font-gujarati">
                  <Link
                    href="/report"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>📄 બાપાના પત્ર માટે રિપોર્ટ (PDF)</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>લોગઆઉટ (નામ બદલો)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
