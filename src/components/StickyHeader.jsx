'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  ChevronDown,
  Award,
  Users,
  Home,
  MessageSquareQuote,
  Trophy,
  Target,
  Pencil,
  Crown,
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
    openEditNameModal,
    isAdminUser,
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
  ];

  return (
    <header className={`sticky top-0 z-40 transition-colors ${theme.headerBg}`}>
      <div className="max-w-5xl mx-auto px-2.5 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
        {/* Left: Brand Block */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group min-w-0 shrink">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/90 border border-amber-900/10 shadow-2xs p-1 transition-transform group-hover:scale-105 shrink-0">
            <Image
              src="/logo.png"
              alt="ગુણગ્રહણ લોગો"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span className="font-extrabold text-xs sm:text-base md:text-lg tracking-tight text-stone-900 truncate leading-tight">
              ગુણગ્રહણ એપ
            </span>
            <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold shadow-2xs shrink-0 whitespace-nowrap ${theme.primarySoftBg}`}>
              {theme.wingLabelGujarati}
            </span>
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Admin Quick Entry Button if Admin */}
              {isAdminUser && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-400/70 shadow-2xs hover:shadow-xs transition-all active:scale-95 shrink-0"
                  title="એડમિન કંટ્રોલ પેનલ (સર્વ નિયંત્રણ)"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="font-gujarati font-extrabold hidden md:inline">એડમિન</span>
                </Link>
              )}

              {/* Writer Milestone Pill Badge */}
              <div
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition ${myWriterBadge.colorClass}`}
                title={`તમારું લેખક પદવી: ${myWriterBadge.title}`}
              >
                <span>{myWriterBadge.icon}</span>
                <span className="font-gujarati">{myWriterBadge.title}</span>
              </div>

              {/* Avatar Pill Button: Elegant Handmade Medallion */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-95 focus:outline-none shrink-0 ${
                  isMenuOpen ? 'ring-2 ring-amber-400/50 bg-amber-100' : ''
                }`}
                aria-label="User profile menu"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 select-none ${theme.avatarBadge}`}
                >
                  {userInitial}
                </div>
                <span className="text-xs font-bold text-stone-800 font-gujarati max-w-[45px] sm:max-w-[100px] truncate leading-none">
                  {currentUser.name}
                </span>
                <ChevronDown
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-900/60 transition-transform duration-200 shrink-0 ${
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
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm font-bold text-stone-900 truncate font-gujarati">
                      {currentUser.name}
                    </p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditNameModal();
                      }}
                      className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 rounded-lg transition"
                      title="તમારું નામ સુધારો"
                      aria-label="Edit Name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

                <div className="py-1 text-sm font-gujarati divide-y divide-stone-100">
                  {/* Admin Control Center Link (Visible only to Bhavik) */}
                  {isAdminUser && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-100/70 via-orange-50/50 to-amber-50 hover:bg-amber-100 text-amber-950 transition text-left font-bold border-b border-amber-200/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                        <span>👑 એડમિન કંટ્રોલ પેનલ</span>
                      </div>
                      <span className="text-[10px] bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                        ADMIN
                      </span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openEditNameModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition text-left font-bold"
                  >
                    <Pencil className="w-4 h-4 text-amber-600" />
                    <span>તમારું નામ સુધારો</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition text-left font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>બીજા આઈડીથી લોગિન / લોગઆઉટ</span>
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
