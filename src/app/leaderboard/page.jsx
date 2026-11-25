'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Search, Sparkles, Award, Crown } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getNextBadgeMotivation, getFirstGrapheme } from '@/lib/utils';

export default function LeaderboardPage() {
  const {
    writerLeaderboard,
    currentUser,
    myWrittenCount,
    theme,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');

  // Find user's rank
  const userRankIndex = writerLeaderboard.findIndex(
    (item) => item.authorId === currentUser?.id
  );
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;
  const motivationText = getNextBadgeMotivation(myWrittenCount, userRank);

  // Top 3 for podium
  const rank1 = writerLeaderboard[0];
  const rank2 = writerLeaderboard[1];
  const rank3 = writerLeaderboard[2];

  // Filter writers
  const filteredLeaderboard = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return writerLeaderboard;
    return writerLeaderboard.filter((w) => w.authorName.toLowerCase().includes(q));
  }, [writerLeaderboard, searchQuery]);

  const maxCount = writerLeaderboard[0]?.count || 1;

  const getRankMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-900/10 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-950 shadow-sm shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 font-gujarati leading-snug">
                ગુણ લેખક લીડરબોર્ડ
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-900/70 font-gujarati">
                જેણે સૌથી વધુ ગુણ લખ્યા હોય તેમનો શ્રેષ્ઠ ક્રમ
              </p>
            </div>
          </div>

          <span className="text-[11px] sm:text-xs font-bold text-stone-600 font-gujarati bg-stone-100 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
            {writerLeaderboard.length} લેખકો
          </span>
        </div>

        {/* Search Writer Input */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="કાર્યકર કે લેખકનું નામ શોધો..."
            className="w-full pl-10 pr-3 py-2 bg-stone-50/80 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* 2. Royal Ceremonial Podium (Visible when no search active) */}
      {!searchQuery && writerLeaderboard.length >= 2 && (
        <div className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-50/50 via-white to-amber-50/20 border border-amber-900/10 shadow-sm space-y-3">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800/80 font-gujarati">
              👑 સુવર્ણ પોડિયમ
            </span>
          </div>

          {/* Stepped Podium Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 items-end pt-2 pb-1">
            {/* Rank 2 (Silver) */}
            {rank2 ? (
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/90 border border-slate-300 text-center shadow-xs space-y-1 sm:space-y-1.5 flex flex-col items-center min-w-0">
                <span className="text-lg sm:text-xl">🥈</span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 text-slate-800 border-2 border-slate-300 flex items-center justify-center font-bold text-xs sm:text-sm">
                  {getFirstGrapheme(rank2.authorName)}
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-800 font-gujarati truncate w-full px-0.5">
                  {rank2.authorName}
                </p>
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 font-gujarati bg-white/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {rank2.count} ગુણ
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Rank 1 (Gold - Elevated) */}
            {rank1 && (
              <div className="p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-100 via-yellow-100/90 to-amber-200/90 border-2 border-amber-400 text-center shadow-sm space-y-1 sm:space-y-1.5 flex flex-col items-center -translate-y-1.5 sm:-translate-y-2 min-w-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 text-white flex items-center justify-center -mt-1">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 border-2 border-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-xs">
                  {getFirstGrapheme(rank1.authorName)}
                </div>
                <p className="text-[11px] sm:text-sm font-extrabold text-amber-950 font-gujarati truncate w-full px-0.5">
                  {rank1.authorName}
                </p>
                <span className="text-[11px] sm:text-xs font-extrabold text-amber-950 font-gujarati bg-white px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {rank1.count} ગુણ
                </span>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {rank3 ? (
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100/90 border border-orange-200 text-center shadow-xs space-y-1 sm:space-y-1.5 flex flex-col items-center min-w-0">
                <span className="text-lg sm:text-xl">🥉</span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-200 text-orange-900 border-2 border-orange-300 flex items-center justify-center font-bold text-xs sm:text-sm">
                  {getFirstGrapheme(rank3.authorName)}
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-orange-950 font-gujarati truncate w-full px-0.5">
                  {rank3.authorName}
                </p>
                <span className="text-[11px] sm:text-xs font-extrabold text-orange-950 font-gujarati bg-white/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {rank3.count} ગુણ
                </span>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* 3. Personal Motivation Banner */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/80 via-yellow-50/90 to-amber-100/80 border border-amber-300/80 text-xs sm:text-sm font-semibold text-amber-950 flex items-center gap-2 sm:gap-2.5 font-gujarati">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-snug">{motivationText}</span>
      </div>

      {/* 4. Full Leaderboard List */}
      <div className="p-3.5 sm:p-5 rounded-3xl bg-white border border-amber-900/10 shadow-sm space-y-3">
        {filteredLeaderboard.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs sm:text-sm font-gujarati">
            કોઈ લેખક મળ્યા નહીં.
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {filteredLeaderboard.map((item, index) => {
              const isMe = item.authorId === currentUser?.id;
              const barWidth = Math.max(8, Math.round((item.count / maxCount) * 100));
              const isFirst = index === 0;

              return (
                <div
                  key={item.authorId}
                  className={`p-3 sm:p-3.5 rounded-2xl transition-colors border ${
                    isMe
                      ? 'bg-blue-50/80 border-blue-200/90'
                      : 'bg-stone-50/60 border-stone-100 hover:bg-stone-100/60'
                  }`}
                >
                  {/* Top info */}
                  <div className="flex items-start sm:items-center justify-between gap-2 text-xs sm:text-sm font-semibold mb-2">
                    <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm sm:text-base shrink-0 w-6 sm:w-7 text-center font-bold pt-0.5 sm:pt-0">
                        {getRankMedal(index)}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 flex-1">
                        <span className="font-gujarati text-stone-800 text-xs sm:text-sm leading-snug break-words">
                          {item.authorName}
                        </span>
                        {isMe && (
                          <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                            તમે
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-gujarati shrink-0 whitespace-nowrap ${item.badge.colorClass}`}
                        >
                          <span>{item.badge.icon}</span>
                          <span>{item.badge.title}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-1 whitespace-nowrap">
                      <span className="font-extrabold text-stone-900 font-gujarati text-sm sm:text-base">
                        {item.count}
                      </span>
                      <span className="text-[11px] sm:text-xs text-stone-500 font-gujarati ml-1">
                        ગુણ
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isFirst
                          ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
                          : theme.progressBarFill
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
