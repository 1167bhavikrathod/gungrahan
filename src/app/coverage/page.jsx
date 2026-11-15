'use client';

import React, { useState, useMemo } from 'react';
import { Target, CheckCircle2, PlusCircle, Search, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getFirstGrapheme } from '@/lib/utils';

export default function CoveragePage() {
  const {
    currentUser,
    myCoverageStats,
    theme,
    openAddModal,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('unwritten'); // 'unwritten' | 'covered'
  const [searchQuery, setSearchQuery] = useState('');

  const coveredCount = myCoverageStats.coveredCount || 0;
  const totalOthers = myCoverageStats.totalOthers || 1;
  const unwrittenCount = myCoverageStats.unwrittenKaryakars?.length || 0;
  const coveragePercent = Math.min(100, Math.round((coveredCount / Math.max(1, totalOthers)) * 100));

  // Filtered lists
  const unwrittenList = useMemo(() => {
    let list = myCoverageStats.unwrittenKaryakars || [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((k) => k.name.toLowerCase().includes(q));
    }
    return list;
  }, [myCoverageStats.unwrittenKaryakars, searchQuery]);

  const coveredList = useMemo(() => {
    let list = myCoverageStats.coveredKaryakars || [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((k) => k.name.toLowerCase().includes(q));
    }
    return list;
  }, [myCoverageStats.coveredKaryakars, searchQuery]);

  // SVG parameters for big coverage ring
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference - (coveragePercent / 100) * ringCircumference;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* 1. Large Coverage Gauge Card */}
      <div className={`p-5 sm:p-6 rounded-3xl bg-white border border-amber-900/10 shadow-[0_6px_24px_-4px_rgba(180,83,9,0.05)] space-y-4 relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Big Circular SVG Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="none"
                stroke="#F5F5F4"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="none"
                stroke={coveragePercent >= 100 ? '#10B981' : theme.isBal ? '#1D4ED8' : '#F43F5E'}
                strokeWidth="8"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-stone-900">{coveragePercent}%</span>
              <span className="text-[10px] text-amber-800/80 font-bold uppercase">કવરેજ</span>
            </div>
          </div>

          {/* Text Summary */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300/80">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>૨૦/૨૦ કાર્યકર ચેકલિસ્ટ</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 font-gujarati">
              તમે {totalOthers} માંથી {coveredCount} કાર્યકરોના ગુણ લખ્યા છે
            </h1>
            <p className="text-xs text-stone-500 font-gujarati leading-relaxed">
              દરેક કાર્યકરનો ઓછામાં ઓછો એક ગુણ લખવાનો પવિત્ર સંકલ્પ — કોઈ કાર્યકર બાકી ન રહે!
            </p>
          </div>
        </div>

        {/* Milestone badge */}
        {unwrittenCount === 0 ? (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-center gap-2 font-gujarati text-center shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>🎉 અદ્ભુત! તમે મંડળના બધા જ કાર્યકરોના ગુણ લખી લીધા છે!</span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/80 text-xs font-semibold text-amber-950 flex items-center justify-between font-gujarati shadow-2xs">
            <span>બાકી રહેલા કાર્યકરો: <strong className="text-amber-800 text-sm">{unwrittenCount}</strong></span>
            <span>પૂર્ણ થયેલા: <strong className="text-emerald-700 text-sm">{coveredCount}</strong></span>
          </div>
        )}
      </div>

      {/* 2. Search & Tab Filter Controls */}
      <div className={`p-4 rounded-3xl bg-white border border-amber-900/10 shadow-[0_6px_24px_-4px_rgba(180,83,9,0.05)] space-y-3`}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="કાર્યકરનું નામ શોધો..."
            className="w-full pl-10 pr-3 py-2 bg-stone-50/80 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl">
          <button
            onClick={() => setActiveTab('unwritten')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition font-gujarati text-center ${
              activeTab === 'unwritten'
                ? theme.pillActive
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            બાકી રહેલા ({unwrittenCount})
          </button>

          <button
            onClick={() => setActiveTab('covered')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition font-gujarati text-center ${
              activeTab === 'covered'
                ? theme.pillActive
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            કવર થયેલા ({coveredCount})
          </button>
        </div>
      </div>

      {/* 3. Karyakars List */}
      <div className="space-y-2.5">
        {activeTab === 'unwritten' && (
          <>
            {unwrittenList.length > 0 ? (
              unwrittenList.map((karyakar) => {
                const initial = getFirstGrapheme(karyakar.name);
                return (
                  <div
                    key={karyakar.id}
                    className="p-3.5 sm:p-4 bg-white rounded-2xl border border-amber-900/10 shadow-[0_4px_16px_-4px_rgba(180,83,9,0.04)] hover:border-amber-300 transition flex items-center justify-between gap-2.5 sm:gap-3"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${theme.avatarBadge}`}>
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-stone-900 font-gujarati truncate">
                          {karyakar.name}
                        </p>
                        <p className="text-xs text-amber-800 font-gujarati font-medium truncate">
                          હજુ સુધી ગુણ લખાયો નથી
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => openAddModal(karyakar.id)}
                      className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 shrink-0 transition active:scale-95 shadow-xs font-gujarati ${theme.primaryGradient}`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                      <span className="whitespace-nowrap">ગુણ લખો</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-amber-900/10 space-y-2 shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-stone-900 font-gujarati">
                  બધા કાર્યકરોના ગુણ લખાઈ ગયા છે!
                </p>
                <p className="text-xs text-stone-500 font-gujarati">
                  તમે દરેક કાર્યકરનો ઓછામાં ઓછો એક ગુણ લખી લીધો છે.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'covered' && (
          <>
            {coveredList.length > 0 ? (
              coveredList.map((karyakar) => {
                const initial = getFirstGrapheme(karyakar.name);
                const writtenGunas = myCoverageStats.writtenMap[karyakar.id] || [];
                return (
                  <div
                    key={karyakar.id}
                    className="p-3.5 sm:p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-[0_4px_16px_-4px_rgba(180,83,9,0.04)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-stone-900 font-gujarati truncate">
                            {karyakar.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 font-gujarati truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{writtenGunas.length} ગુણ લખાયા</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openAddModal(karyakar.id)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200/90 hover:bg-blue-100 transition font-gujarati shrink-0 shadow-2xs whitespace-nowrap"
                      >
                        + બીજો ગુણ લખો
                      </button>
                    </div>

                    {/* Preview of written gunas */}
                    {writtenGunas.length > 0 && (
                      <div className="pl-3.5 border-l-2 border-emerald-400 py-0.5 text-xs text-stone-700 font-gujarati italic leading-relaxed">
                        &ldquo;{writtenGunas[0].content}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-amber-900/10 text-xs text-stone-400 font-gujarati shadow-xs">
                હજુ સુધી કોઈ કાર્યકર કવર થયા નથી.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
