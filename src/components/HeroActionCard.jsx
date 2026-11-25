'use client';

import React from 'react';
import { PlusCircle, Target, CheckCircle2, Trees, Sprout, Flower2 } from 'lucide-react';

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

  // 4 Living Stages of the Sacred Tree
  const treeStages = [
    { target: 50, icon: '🌱', label: 'અંકુર', targetNum: '૫૦' },
    { target: 100, icon: '🌿', label: 'પલ્લવ', targetNum: '૧૦૦' },
    { target: 150, icon: '🌸', label: 'પુષ્પ', targetNum: '૧૫૦' },
    { target: 200, icon: '🌳', label: 'સંપ વૃક્ષ', targetNum: '૨૦૦' },
  ];

  // Active milestone celebratory banner message
  let celebrationBanner = null;
  if (totalWrittenCount >= 200) {
    celebrationBanner = {
      text: '🏆 અદ્ભુત! ૨૦૦+ ગુણનો સુવર્ણ લક્ષ્યાંક પૂર્ણ! બાપા સર્વે પર રાજીપો વરસાવશે!',
      classes: 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 text-amber-950 border-amber-300 shadow-sm animate-pulse',
    };
  } else if (totalWrittenCount >= 150) {
    celebrationBanner = {
      text: '🌸 ૧૫૦ ગુણનું પુષ્પ ખીલ્યું! પૂર્ણ લક્ષ્યાંકથી માત્ર થોડા જ ડગલાં દૂર!',
      classes: 'bg-amber-50 text-amber-900 border-amber-200/90 shadow-xs',
    };
  } else if (totalWrittenCount >= 100) {
    celebrationBanner = {
      text: '🌿 ધન્યવાદ! આપણે ૧૦૦ ગુણનો ભવ્ય પડાવ સફળતાપૂર્વક પાર કર્યો!',
      classes: 'bg-blue-50 text-blue-900 border-blue-200/90 shadow-xs',
    };
  } else if (totalWrittenCount >= 50) {
    celebrationBanner = {
      text: '🌱 વાહ! ૫૦ ગુણનું પવિત્ર સંપ વૃક્ષ અંકુરિત થઈ ગયું છે!',
      classes: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 shadow-xs',
    };
  }

  // SVG parameters for coverage ring
  const ringRadius = 15;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference - (coveragePercent / 100) * ringCircumference;

  return (
    <div className={`p-4 sm:p-6 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-4 sm:space-y-5 relative overflow-hidden`}>
      {/* 1. Primary CTA Button - Royal Mandir Finish */}
      <button
        onClick={() => onOpenAddModal()}
        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-base transition-transform shadow-md ${theme.primaryGradient}`}
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-amber-200" />
        </div>
        <span className="font-gujarati tracking-wide text-white text-base sm:text-lg">
          નવો ગુણ ઉમેરો
        </span>
      </button>

      {/* 2. Living "સંપ વૃક્ષ" (Tree of Unity) Visual Progress Track */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border border-amber-900/10 space-y-3">
        <div className="flex items-start sm:items-center justify-between gap-2 font-gujarati">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg shrink-0">🌳</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                સંપ વૃક્ષ • સમૂહ લક્ષ્યાંક
              </h3>
              <p className="text-[11px] text-amber-800/80 -mt-0.5">
                ૨૦૦ પવિત્ર ગુણોનું બાપાના ચરણોમાં અર્ઘ્ય
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 whitespace-nowrap">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-900">
              {totalWrittenCount}
            </span>
            <span className="text-xs text-stone-400 font-bold"> / {targetCount}</span>
          </div>
        </div>

        {/* The Golden Progress Track with Checkpoint Nodes */}
        <div className="relative pt-2 pb-1">
          {/* Background Rail */}
          <div className="relative w-full h-3 bg-stone-200/80 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-[width] duration-500 ease-out rounded-full ${theme.progressBarFill}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 4 Interactive Living Checkpoint Nodes */}
          <div className="grid grid-cols-4 gap-0.5 sm:gap-1 pt-3 text-center">
            {treeStages.map((stage) => {
              const isReached = totalWrittenCount >= stage.target;
              return (
                <div
                  key={stage.target}
                  className={`flex flex-col items-center ${
                    isReached ? 'scale-105' : 'opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${
                      isReached
                        ? 'bg-amber-100 border-2 border-amber-500'
                        : 'bg-stone-100 border border-stone-200'
                    }`}
                  >
                    <span>{stage.icon}</span>
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold font-gujarati mt-1 leading-tight text-center ${
                      isReached ? 'text-amber-900' : 'text-stone-400'
                    }`}
                  >
                    {stage.label} ({stage.targetNum})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Celebration Banner */}
        {celebrationBanner && (
          <div
            className={`p-2.5 rounded-xl border text-xs text-center font-bold font-gujarati ${celebrationBanner.classes}`}
          >
            {celebrationBanner.text}
          </div>
        )}
      </div>

      {/* 3. Personal "Coverage Ring" Card - Handcrafted Seal Style */}
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
        className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/40 via-white to-orange-50/20 border border-amber-900/10 flex items-center justify-between gap-2 cursor-pointer hover:border-amber-300 active:scale-[0.99] transition-colors group"
      >
        {/* Left: SVG Gauge + Spiritual Copy */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r={ringRadius}
                fill="none"
                stroke="#E7E5E4"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r={ringRadius}
                fill="none"
                stroke={coveragePercent >= 100 ? '#10B981' : theme.isBal ? '#1D4ED8' : '#F43F5E'}
                strokeWidth="3.5"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeOffset}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-stone-700">
              {coveragePercent}%
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-stone-900 font-gujarati leading-snug">
              🎯 તમે {totalOthers} માંથી {coveredCount} કાર્યકરોના ગુણ લખ્યા
            </p>
            <p className="text-[11px] text-stone-500 font-gujarati leading-snug">
              કોઈ કાર્યકર બાકી ન રહે તેવો પવિત્ર સંકલ્પ
            </p>
          </div>
        </div>

        {/* Right: Action Pill */}
        <div className="shrink-0">
          {unwrittenCount > 0 ? (
            <span className="inline-flex items-center text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 px-2.5 py-1 rounded-full transition-colors font-gujarati whitespace-nowrap">
              બાકી {unwrittenCount} →
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full font-gujarati whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> બધા કવર!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
