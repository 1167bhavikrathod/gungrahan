'use client';

import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { getNextBadgeMotivation } from '@/lib/utils';

export default function WriterLeaderboard({
  writerLeaderboard = [],
  currentUserId,
  myWrittenCount = 0,
  theme,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Top 5 or full list
  const displayList = isExpanded ? writerLeaderboard : writerLeaderboard.slice(0, 5);
  const maxCount = writerLeaderboard[0]?.count || 1;

  // Find user rank
  const userRankIndex = writerLeaderboard.findIndex((item) => item.authorId === currentUserId);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;
  const motivationText = getNextBadgeMotivation(myWrittenCount, userRank);

  const getRankMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-4`}>
      {/* Leaderboard Header */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-stone-900 font-gujarati">
              ગુણ લેખક લીડરબોર્ડ
            </h2>
            <p className="text-[11px] text-stone-500 font-gujarati">
              જેણે સૌથી વધુ ગુણ લખ્યા હોય તેમનો શ્રેષ્ઠ ક્રમ
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-semibold shrink-0 whitespace-nowrap">
          {writerLeaderboard.length} લેખકો
        </span>
      </div>

      {/* Leaderboard Rows */}
      {writerLeaderboard.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs font-gujarati">
          હજુ સુધી કોઈ ગુણ લખાયા નથી. પ્રથમ ગુણ લખીને લીડરબોર્ડ શરૂ કરો!
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((item, index) => {
            const isMe = item.authorId === currentUserId;
            const barWidth = Math.max(8, Math.round((item.count / maxCount) * 100));
            const isFirst = index === 0;

            return (
              <div
                key={item.authorId}
                className={`p-3 rounded-2xl transition border ${isMe ? 'bg-blue-50/70 border-blue-200 shadow-xs' : 'bg-amber-50/30 border-amber-900/10 hover:bg-amber-100/40'}`}
              >
                {/* Top Info Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0 w-6 text-center font-bold">
                      {getRankMedal(index)}
                    </span>
                    <span className="truncate font-gujarati text-stone-800">
                      {item.authorName}
                    </span>
                    {isMe && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                        તમે
                      </span>
                    )}
                    {/* Writer Milestone Badge */}
                    <span
                      className={`hidden sm:inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full border font-gujarati shrink-0 ${item.badge.colorClass}`}
                    >
                      <span>{item.badge.icon}</span>
                      <span>{item.badge.title}</span>
                    </span>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-bold text-stone-900 font-gujarati text-sm">
                      {item.count}
                    </span>
                    <span className="text-[11px] text-stone-500 font-gujarati ml-1">
                      ગુણ
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full h-2 bg-amber-100/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isFirst ? 'bg-gradient-to-r from-amber-400 to-orange-500' : theme.progressBarFill}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expand/Collapse Button */}
      {writerLeaderboard.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition font-gujarati"
        >
          {isExpanded ? (
            <>
              <span>ઓછા જુઓ</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>બધા કાર્યકરોનો ક્રમ જુઓ ({writerLeaderboard.length})</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Motivation Footer for Logged In User */}
      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs font-medium text-amber-900 flex items-center gap-2 font-gujarati">
        <Award className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-snug">{motivationText}</span>
      </div>
    </div>
  );
}
