'use client';

import React, { useState, useMemo } from 'react';
import { Target, CheckCircle2, PlusCircle, Search, UserCheck, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getFirstGrapheme } from '@/lib/utils';

export default function CoveragePage() {
  const {
    currentUser,
    myCoverageStats,
    theme,
    openAddModal,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('unwritten'); // 'unwritten' | 'covered' | 'all'
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
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* 1. Large Coverage Gauge Card */}
      <div className={`p-5 sm:p-6 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-4`}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Big Circular SVG Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="none"
                stroke={coveragePercent >= 100 ? '#10B981' : theme.isBal ? '#2563EB' : '#F43F5E'}
                strokeWidth="8"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900">{coveragePercent}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">કવરેજ</span>
            </div>
          </div>

          {/* Text Summary */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span>૨૦/૨૦ કાર્યકર ચેકલિસ્ટ</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-gujarati">
              તમે {totalOthers} માંથી {coveredCount} કાર્યકરોના ગુણ લખ્યા છે
            </h1>
            <p className="text-xs text-slate-500 font-gujarati leading-relaxed">
              દરેક કાર્યકરનો ઓછામાં ઓછો એક ગુણ લખવાનો પવિત્ર સંકલ્પ — કોઈ કાર્યકર બાકી ન રહે!
            </p>
          </div>
        </div>

        {/* Milestone badge */}
        {unwrittenCount === 0 ? (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 font-gujarati text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>🎉 અદ્ભુત! તમે મંડળના બધા જ કાર્યકરોના ગુણ લખી લીધા છે!</span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between font-gujarati">
            <span>બાકી રહેલા કાર્યકરો: <strong>{unwrittenCount}</strong></span>
            <span>પૂર્ણ થયેલા: <strong>{coveredCount}</strong></span>
          </div>
        )}
      </div>

      {/* 2. Search & Tab Filter Controls */}
      <div className={`p-4 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-3`}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="કાર્યકરનું નામ શોધો..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-gujarati text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('unwritten')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition font-gujarati text-center ${
              activeTab === 'unwritten'
                ? theme.pillActive
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            બાકી રહેલા ({unwrittenCount})
          </button>

          <button
            onClick={() => setActiveTab('covered')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition font-gujarati text-center ${
              activeTab === 'covered'
                ? theme.pillActive
                : 'text-slate-600 hover:text-slate-900'
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
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${theme.avatarBadge}`}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 font-gujarati truncate">
                          {karyakar.name}
                        </p>
                        <p className="text-xs text-amber-700 font-gujarati">
                          હજુ સુધી ગુણ લખ્યો નથી
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => openAddModal(karyakar.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-xs font-gujarati ${theme.primaryGradient}`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ ગુણ લખો</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800 font-gujarati">
                  બધા કાર્યકરોના ગુણ લખાઈ ગયા છે!
                </p>
                <p className="text-xs text-slate-400 font-gujarati">
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
                    className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 font-gujarati truncate">
                            {karyakar.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 font-gujarati">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {writtenGunas.length} ગુણ લખાયા
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openAddModal(karyakar.id)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition font-gujarati shrink-0"
                      >
                        + બીજો ગુણ લખો
                      </button>
                    </div>

                    {/* Preview of written gunas */}
                    {writtenGunas.length > 0 && (
                      <div className="pl-3 border-l-2 border-emerald-300 py-0.5 text-xs text-slate-600 font-gujarati italic">
                        &ldquo;{writtenGunas[0].content}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-400 font-gujarati">
                હજુ સુધી કોઈ કાર્યકર કવર થયા નથી.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
