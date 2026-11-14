'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
import TilakChandlo from '@/components/TilakChandlo';
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
            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm border border-amber-300/40 bg-white/80`}
          >
            <TilakChandlo className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900">
                ગુણગ્રહણ એપ
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${theme.primarySoftBg}`}>
                {theme.wingLabelGujarati}
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 font-gujarati -mt-0.5">
              રમતોત્સવ ગુણ મહોત્સવ
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-amber-50/80 p-1 rounded-2xl border border-amber-900/10 shadow-2xs">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-gujarati font-bold transition ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs border border-amber-200/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
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
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition ${myWriterBadge.colorClass}`}
                title={`તમારું લેખક પદવી: ${myWriterBadge.title}`}
              >
                <span>{myWriterBadge.icon}</span>
                <span className="font-gujarati">{myWriterBadge.title}</span>
              </div>

              {/* Avatar Pill Button: Elegant Handmade Medallion */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-95 focus:outline-none ${
                  isMenuOpen ? 'ring-2 ring-amber-400/50 bg-amber-100' : ''
                }`}
                aria-label="User profile menu"
              >
                <div
                  className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 select-none ${theme.avatarBadge}`}
                  style={{ width: '32px', height: '32px' }}
                >
                  {userInitial}
                </div>
                <span className="text-xs font-bold text-stone-800 font-gujarati max-w-[70px] sm:max-w-[100px] truncate leading-none">
                  {currentUser.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-900/60 transition-transform duration-200 shrink-0 ${
                    isMenuOpen ? 'rotate-180 text-amber-700' : ''
                  }`}
                />
              </button>
            </div>

            {/* Profile Popover Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-amber-900/10 py-2 z-50 animate-fadeIn overflow-hidden">
                <div className="px-4 py-3 border-b border-amber-100/70 bg-gradient-to-r from-amber-50/60 to-orange-50/30">
                  <p className="text-[11px] text-amber-900/70 font-semibold">લોગિન કરેલ કાર્યકર</p>
                  <p className="text-sm font-bold text-stone-900 truncate font-gujarati mt-0.5">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${myWriterBadge.colorClass}`}>
                      {myWriterBadge.icon} {myWriterBadge.title}
                    </span>
                    <span className="text-xs text-stone-500 font-bold">
                      ({myWrittenCount} ગુણ)
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-stone-50/70 border-b border-stone-100 text-xs text-stone-600 space-y-1.5 font-gujarati">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      તમે લખેલા ગુણ:
                    </span>
                    <span className="font-extrabold text-stone-800">{myWrittenCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      કાર્યકર કવરેજ:
                    </span>
                    <span className="font-extrabold text-stone-800">
                      🎯 {myCoverageStats.coveredCount}/{myCoverageStats.totalOthers}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-sm font-gujarati">
                  <Link
                    href="/report"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition"
                  >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>બાપાનો પત્ર અને રિપોર્ટ</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition text-left font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>નામ બદલો / લોગઆઉટ</span>
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
