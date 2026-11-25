'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  ArrowRight,
  MessageSquareQuote,
  Target,
  CheckCircle2,
  Award,
  Pencil,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import HeroActionCard from '@/components/HeroActionCard';
import GunaCard from '@/components/GunaCard';

export default function HomePage() {
  const {
    currentUser,
    theme,
    targetGunas,
    activeProject,
    projectStatus,
    totalWrittenCount,
    myWrittenCount,
    myWriterBadge,
    writerLeaderboard,
    myCoverageStats,
    gunas,
    openAddModal,
    openCoverageAddModal,
    handleRajipoIncrement,
    setEditingGuna,
    openEditNameModal,
  } = useAppContext();

  // Find user's rank on leaderboard
  const userRankIndex = writerLeaderboard.findIndex(
    (item) => item.authorId === currentUser?.id
  );
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : '-';

  // Recent 3 gunas
  const recentGunas = gunas.slice(0, 3);

  // Top 3 writers
  const topThree = writerLeaderboard.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. Welcome Card for Logged In User */}
      {currentUser && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40 border border-amber-900/10 shadow-sm flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-amber-900/70 font-semibold font-gujarati">
              જય સ્વામિનારાયણ,
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 font-gujarati truncate">
                {currentUser.name}
              </h1>
              <button
                onClick={openEditNameModal}
                className="p-1 rounded-lg text-amber-700/70 hover:text-amber-900 hover:bg-amber-100/80 transition shrink-0"
                title="તમારું નામ સુધારો"
                aria-label="Edit your name"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold border shadow-2xs shrink-0 whitespace-nowrap ${myWriterBadge.colorClass}`}
          >
            <span>{myWriterBadge.icon}</span>
            <span className="font-gujarati">{myWriterBadge.title}</span>
          </div>
        </div>
      )}

      {/* 2. Hero Action Card (+ Add ગુણ, સંપ વૃક્ષ, Coverage Ring) */}
      <HeroActionCard
        totalWrittenCount={totalWrittenCount}
        targetCount={targetGunas}
        myCoverageStats={myCoverageStats}
        activeProject={activeProject}
        projectStatus={projectStatus}
        theme={theme}
        onOpenAddModal={() => openAddModal(null)}
        onOpenCoverageFilter={openCoverageAddModal}
      />

      {/* 3. Quick Stats Snapshot 3-Column Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {/* Total Gunas */}
        <Link
          href="/feed"
          className="p-2 sm:p-3 bg-white rounded-2xl border border-amber-900/10 shadow-[0_4px_16px_-4px_rgba(180,83,9,0.04)] hover:border-blue-300 transition text-center group"
        >
          <div className="w-7 h-7 mx-auto rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-1 group-hover:scale-110 transition-transform">
            <MessageSquareQuote className="w-4 h-4" />
          </div>
          <p className="text-[11px] sm:text-xs text-stone-400 font-gujarati truncate">કુલ ગુણ</p>
          <p className="text-sm sm:text-base font-bold text-stone-800 font-gujarati">
            {totalWrittenCount}
          </p>
        </Link>

        {/* User Rank */}
        <Link
          href="/leaderboard"
          className="p-2 sm:p-3 bg-white rounded-2xl border border-amber-900/10 shadow-[0_4px_16px_-4px_rgba(180,83,9,0.04)] hover:border-amber-300 transition text-center group"
        >
          <div className="w-7 h-7 mx-auto rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-1 group-hover:scale-110 transition-transform">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-[11px] sm:text-xs text-stone-400 font-gujarati truncate">તમારો ક્રમ</p>
          <p className="text-sm sm:text-base font-bold text-amber-700 font-gujarati">
            {userRank !== '-' ? `#${userRank}` : '-'}
          </p>
        </Link>

        {/* Coverage */}
        <Link
          href="/coverage"
          className="p-2 sm:p-3 bg-white rounded-2xl border border-amber-900/10 shadow-[0_4px_16px_-4px_rgba(180,83,9,0.04)] hover:border-emerald-300 transition text-center group"
        >
          <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-[11px] sm:text-xs text-stone-400 font-gujarati truncate">કવરેજ</p>
          <p className="text-sm sm:text-base font-bold text-emerald-700 font-gujarati">
            {myCoverageStats.coveredCount}/{myCoverageStats.totalOthers}
          </p>
        </Link>
      </div>

      {/* 4. Top 3 Writers Podium Snapshot Card */}
      <div className={`p-4 sm:p-5 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm sm:text-base text-stone-900 font-gujarati">
              લીડરબોર્ડ • શ્રેષ્ઠ લેખકો
            </h2>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition font-gujarati"
          >
            <span>બધા રેન્ક જુઓ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topThree.length > 0 ? (
          <div className="space-y-2">
            {topThree.map((item, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const isMe = item.authorId === currentUser?.id;
              return (
                <div
                  key={item.authorId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition ${
                    isMe
                      ? 'bg-blue-50/80 border-blue-200'
                      : 'bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{medals[idx]}</span>
                    <span className="font-gujarati text-slate-800 truncate">
                      {item.authorName}
                    </span>
                    {isMe && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                        તમે
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 font-gujarati shrink-0 pl-2">
                    {item.count} ગુણ
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-gujarati text-center py-2">
            હજુ કોઈ ગુણ લખાયા નથી. પ્રથમ ગુણ લખો!
          </p>
        )}
      </div>

      {/* 5. Recent Guna Feed Preview Card */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-amber-700" />
            <h2 className="font-bold text-sm sm:text-base text-stone-900 font-gujarati">
              તાજેતરના ગુણ
            </h2>
          </div>

          <Link
            href="/feed"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition font-gujarati"
          >
            <span>બધા ગુણ ({gunas.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentGunas.length > 0 ? (
          <div className="space-y-3">
            {recentGunas.map((guna) => (
              <GunaCard
                key={guna.id}
                guna={guna}
                isMyWritten={guna.author_id === currentUser?.id}
                isAboutMe={guna.recipient_id === currentUser?.id}
                theme={theme}
                onRajipoIncrement={handleRajipoIncrement}
                onEdit={projectStatus?.isSubmissionClosed ? null : (g) => setEditingGuna(g)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 font-gujarati">
            હજુ સુધી કોઈ ગુણ ઉમેરાયા નથી.
          </div>
        )}
      </div>
    </div>
  );
}
