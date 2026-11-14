'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Search, Sparkles, Award } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getNextBadgeMotivation } from '@/lib/utils';

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
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Header Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 font-gujarati flex items-center gap-1.5">
                ગુણ લેખક લીડરબોર્ડ
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  Writer-First
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-gujarati">
                જેણે સૌથી વધુ ગુણ લખ્યા હોય તેમનો ક્રમ (ગુણના ભિખારી)
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 font-gujarati">
            {writerLeaderboard.length} લેખકો
          </span>
        </div>

        {/* Search Writer Input */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="લેખકનું નામ શોધો..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-gujarati text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Motivation Footer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs sm:text-sm font-medium text-amber-900 flex items-center gap-2 font-gujarati">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-snug">{motivationText}</span>
      </div>

      {/* Full Leaderboard List */}
      <div className={`p-4 sm:p-5 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-3`}>
        {filteredLeaderboard.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs sm:text-sm font-gujarati">
            કોઈ લેખક મળ્યા નહીં.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeaderboard.map((item, index) => {
              const isMe = item.authorId === currentUser?.id;
              const barWidth = Math.max(8, Math.round((item.count / maxCount) * 100));
              const isFirst = index === 0;

              return (
                <div
                  key={item.authorId}
                  className={`p-3.5 rounded-2xl transition border ${
                    isMe
                      ? 'bg-blue-50/80 border-blue-200 shadow-xs'
                      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/70'
                  }`}
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0 w-7 text-center font-bold">
                        {getRankMedal(index)}
                      </span>
                      <span className="truncate font-gujarati text-slate-800 text-sm">
                        {item.authorName}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                          તમે
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full border font-gujarati shrink-0 ${item.badge.colorClass}`}
                      >
                        <span>{item.badge.icon}</span>
                        <span>{item.badge.title}</span>
                      </span>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="font-bold text-slate-900 font-gujarati text-sm sm:text-base">
                        {item.count}
                      </span>
                      <span className="text-xs text-slate-500 font-gujarati ml-1">
                        ગુણ
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFirst
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
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
