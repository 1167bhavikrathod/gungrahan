'use client';

import React from 'react';
import { PlusCircle, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HeroActionCard({
  totalWrittenCount = 0,
  targetCount = 200,
  myCoverageStats,
  theme,
  onOpenAddModal,
  onOpenCoverageFilter,
}) {
  const coveredCount = myCoverageStats?.coveredCount || 0;
  const totalOthers = myCoverageStats?.totalOthers || 1;
  const unwrittenCount = myCoverageStats?.unwrittenKaryakars?.length || 0;

  // Percentage of collective milestone
  const progressPercent = Math.min(100, Math.round((totalWrittenCount / targetCount) * 100));

  // Personal coverage percentage
  const coveragePercent = Math.min(100, Math.round((coveredCount / Math.max(1, totalOthers)) * 100));

  // Checkpoints: 50, 100, 150, 200
  const checkpoints = [
    { target: 50, label: '૫૦' },
    { target: 100, label: '૧૦૦' },
    { target: 150, label: '૧૫૦' },
    { target: 200, label: '૨૦૦' },
  ];

  // Active milestone celebratory banner message
  let celebrationBanner = null;
  if (totalWrittenCount >= 200) {
    celebrationBanner = {
      text: '🏆 અદ્ભુત! ૨૦૦+ ગુણનો મહા-લક્ષ્યાંક પૂર્ણ! બાપા રાજીપો વરસાવશે!',
      classes: 'bg-amber-100/90 text-amber-900 border-amber-300 animate-pulse',
    };
  } else if (totalWrittenCount >= 150) {
    celebrationBanner = {
      text: '🌟 ૧૫૦ ગુણનો પડાવ પાર! લક્ષ્યાંકથી માત્ર થોડા જ દૂર!',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  } else if (totalWrittenCount >= 100) {
    celebrationBanner = {
      text: '🎉 અભિનંદન! આપણે ૧૦૦ ગુણનો પડાવ પાર કર્યો!',
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
    };
  } else if (totalWrittenCount >= 50) {
    celebrationBanner = {
      text: '🌱 વાહ! ૫૦ ગુણનું સંપ વૃક્ષ ખીલી ઉઠ્યું છે!',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  // SVG parameters for coverage ring
  const ringRadius = 14;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference - (coveragePercent / 100) * ringCircumference;

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-4`}>
      {/* 1. Primary CTA Button */}
      <button
        onClick={() => onOpenAddModal()}
        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base transition transform active:scale-[0.98] ${theme.primaryGradient}`}
      >
        <PlusCircle className="w-5 h-5" />
        <span className="font-gujarati tracking-wide">+ Add ગુણ (નવો ગુણ લખો)</span>
      </button>

      {/* 2. Total Written ગુણ & 4-Checkpoint સંપ વૃક્ષ Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold font-gujarati">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>સંપ વૃક્ષ • સમૂહ લક્ષ્યાંક</span>
          </div>
          <div className="text-slate-600">
            <span className="text-base font-bold text-slate-900">{totalWrittenCount}</span>
            <span className="text-xs text-slate-400"> / {targetCount} ગુણ</span>
          </div>
        </div>

        {/* Segmented Progress Track */}
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${theme.progressBarFill}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 4 Checkpoint Markers */}
        <div className="flex justify-between px-1 text-[11px] font-medium font-gujarati text-slate-500">
          {checkpoints.map((cp) => {
            const isReached = totalWrittenCount >= cp.target;
            return (
              <span
                key={cp.target}
                className={`flex items-center gap-0.5 transition ${isReached ? 'text-amber-600 font-bold' : 'text-slate-400'}`}
              >
                {isReached ? '✓ ' : '• '}{cp.label}
              </span>
            );
          })}
        </div>

        {/* Active Celebration Banner */}
        {celebrationBanner && (
          <div className={`p-2.5 rounded-xl border text-xs text-center font-bold font-gujarati transition-all ${celebrationBanner.classes}`}>
            {celebrationBanner.text}
          </div>
        )}
      </div>

      {/* 3. Personal Coverage Ring Interactive Pill (Enhancement #4) */}
      <div
        onClick={() => onOpenCoverageFilter()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenCoverageFilter();
          }
        }}
        className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/90 active:scale-[0.99] transition-all group"
      >
        {/* Left Side: SVG Ring + Text */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background Track */}
              <circle
                cx="18"
                cy="18"
                r={ringRadius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3.5"
              />
              {/* Progress Stroke */}
              <circle
                cx="18"
                cy="18"
                r={ringRadius}
                fill="none"
                stroke={coveragePercent >= 100 ? '#10B981' : (theme.isBal ? '#2563EB' : '#F43F5E')}
                strokeWidth="3.5"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
              {coveragePercent}%
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 font-gujarati">
              🎯 તમે {totalOthers} માંથી {coveredCount} કાર્યકરોના ગુણ લખ્યા છે
            </p>
            <p className="text-[11px] text-slate-400 font-gujarati">
              દરેક કાર્યકરનો ઓછામાં ઓછો એક ગુણ લખવાનો સંકલ્પ
            </p>
          </div>
        </div>

        {/* Right Action Badge */}
        <div className="shrink-0 pl-2">
          {unwrittenCount > 0 ? (
            <span className="inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition font-gujarati">
              બાકીના {unwrittenCount} જુઓ →
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 font-gujarati">
              <CheckCircle2 className="w-3.5 h-3.5" /> બધા કવર!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
