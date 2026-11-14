'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Sparkles, Trophy, Edit3, Check } from 'lucide-react';
import { getWriterBadge, formatRelativeTime } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

export default function ReportPage() {
  const { gunas, karyakars, theme, wing } = useAppContext();

  const [viewMode, setViewMode] = useState('bapa-letter'); // 'bapa-letter' | 'chronological' | 'by-writer'
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [customLetter, setCustomLetter] = useState('');

  // Distinct writers count
  const distinctWritersCount = useMemo(() => {
    return new Set(gunas.map((g) => g.author_id)).size;
  }, [gunas]);

  // Default Sacred Offering Letter Text
  const defaultLetterText = useMemo(() => {
    const kCount = distinctWritersCount || karyakars.length;
    const gCount = gunas.length;
    return `પરમ પૂજ્ય બાપા, આપની રુચિ મુજબ રમતોત્સવની સેવા દરમિયાન અમો સર્વે કાર્યકરોએ એકબીજાના અવગુણ જોવાને બદલે માત્ર ગુણ જ જોવાનો સંકલ્પ કર્યો હતો. આ ૫ દિવસ દરમિયાન કુલ ${kCount} કાર્યકરો દ્વારા ${gCount} જેટલા ગુણોનું લેખન થયું છે, જે આપના ચરણોમાં ભક્તિભાવપૂર્વક અર્પણ કરીએ છીએ. આપના રાજીપા અને આશીર્વાદની પ્રાર્થના.`;
  }, [distinctWritersCount, karyakars.length, gunas.length]);

  const currentLetterText = customLetter || defaultLetterText;

  // Top Writers for Smrutibhet Presentation Table (Top 5)
  const topWriters = useMemo(() => {
    const counts = {};
    const names = {};
    const recipientsMap = {};

    gunas.forEach((g) => {
      counts[g.author_id] = (counts[g.author_id] || 0) + 1;
      names[g.author_id] = g.author_name;
      if (!recipientsMap[g.author_id]) {
        recipientsMap[g.author_id] = new Set();
      }
      recipientsMap[g.author_id].add(g.recipient_id);
    });

    const entries = Object.keys(counts).map((authorId) => ({
      authorId,
      authorName: names[authorId] || 'કાર્યકર',
      count: counts[authorId],
      coveredCount: recipientsMap[authorId]?.size || 0,
      badge: getWriterBadge(counts[authorId]),
    }));

    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, 5);
  }, [gunas]);

  // Grouped by Recipient
  const gunasByRecipient = useMemo(() => {
    const map = {};
    gunas.forEach((g) => {
      if (!map[g.recipient_name]) map[g.recipient_name] = [];
      map[g.recipient_name].push(g);
    });
    return map;
  }, [gunas]);

  // Grouped by Writer
  const gunasByWriter = useMemo(() => {
    const map = {};
    gunas.forEach((g) => {
      if (!map[g.author_name]) map[g.author_name] = [];
      map[g.author_name].push(g);
    });
    return map;
  }, [gunas]);

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (gunas.length === 0) {
      alert('એક્સપોર્ટ કરવા માટે કોઈ ડેટા નથી.');
      return;
    }

    const headers = ['તારીખ/સમય', 'ગુણ મેળવનાર', 'લખનાર કાર્યકર', 'ગુણ વિગત', 'રાજીપો કાઉન્ટ'];
    const rows = gunas.map((g) => [
      `"${new Date(g.created_at).toLocaleString('gu-IN')}"`,
      `"${g.recipient_name}"`,
      `"${g.author_name}"`,
      `"${g.content.replace(/"/g, '""')}"`,
      g.rajipo_count || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gunagrahan_Report_${wing}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-4 sm:py-8 px-2 sm:px-4 print:p-0 print:bg-white">
      {/* 1. Interactive Control Toolbar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 p-4 rounded-3xl bg-white shadow-sm border border-amber-900/10 print:hidden space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-amber-800 transition font-gujarati"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ડેશબોર્ડ પર પાછા જાઓ</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-200/80 transition font-gujarati"
            >
              <Download className="w-4 h-4" />
              <span>CSV એક્સપોર્ટ</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition font-gujarati"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ પ્રિન્ટ / PDF ડાઉનલોડ</span>
            </button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-100">
          <span className="text-xs font-semibold text-stone-500 font-gujarati">ફોર્મેટ:</span>
          <button
            onClick={() => setViewMode('bapa-letter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition font-gujarati ${
              viewMode === 'bapa-letter'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50/70 text-stone-700 hover:bg-amber-100/70 border border-amber-200/50'
            }`}
          >
            બાપાનો પત્ર + કાર્યકર પ્રમાણે
          </button>
          <button
            onClick={() => setViewMode('chronological')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition font-gujarati ${
              viewMode === 'chronological'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50/70 text-stone-700 hover:bg-amber-100/70 border border-amber-200/50'
            }`}
          >
            ક્રમાનુસાર (Chronological)
          </button>
          <button
            onClick={() => setViewMode('by-writer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition font-gujarati ${
              viewMode === 'by-writer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50/70 text-stone-700 hover:bg-amber-100/70 border border-amber-200/50'
            }`}
          >
            લેખક પ્રમાણે (By Writer)
          </button>
        </div>
      </div>

      {/* 2. Sacred Print Layout (A4 Container) */}
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 border-4 border-double border-amber-700/80 shadow-xl rounded-2xl print:border-none print:shadow-none print:p-0 print:m-0 space-y-6">
        {/* Sacred Invocation Header */}
        <div className="text-center pb-4 border-b-2 border-amber-600/60 space-y-1">
          <p className="text-sm font-bold text-amber-800 tracking-wider font-gujarati">
            ॥ શ્રી સ્વામિનારાયણો વિજયતેતરામ્ ॥
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-amber-950 font-gujarati">
            પરમ પૂજ્ય મહંત સ્વામી મહારાજના ચરણોમાં ગુણગ્રહણ અર્ઘ્ય
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 font-gujarati">
            રમતોત્સવ ૨૦૨૬ — ગુણગ્રહણ મહોત્સવ વિશેષ અહેવાલ ({theme.wingLabelGujarati})
          </p>
        </div>

        {/* Formal Gujarati Offering Letter Block */}
        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 font-gujarati flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              બાપાના ચરણોમાં પત્ર
            </span>
            <button
              onClick={() => setIsEditingLetter(!isEditingLetter)}
              className="text-[11px] text-amber-800 hover:underline print:hidden flex items-center gap-1 font-gujarati"
            >
              {isEditingLetter ? (
                <>
                  <Check className="w-3.5 h-3.5" /> પૂર્ણ
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> પત્ર એડિટ કરો
                </>
              )}
            </button>
          </div>

          {isEditingLetter ? (
            <textarea
              rows={4}
              value={customLetter || defaultLetterText}
              onChange={(e) => setCustomLetter(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm font-gujarati bg-white border border-amber-300 rounded-xl leading-relaxed focus:outline-none"
            />
          ) : (
            <p className="text-xs sm:text-sm font-gujarati text-slate-800 leading-relaxed text-justify">
              {currentLetterText}
            </p>
          )}

          <div className="pt-2 text-right text-xs font-bold text-amber-950 font-gujarati">
            - સર્વે રમતોત્સવ સેવક કાર્યકરો
          </div>
        </div>

        {/* Smrutibhet Top Writers Honor Table */}
        <div className="space-y-3 page-break-inside-avoid">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 font-gujarati">
              ટોપ ગુણ લેખકો (પૂજ્ય સંતો સમક્ષ સ્મૃતિભેટ અર્પણ યાદી)
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-amber-200/80">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-gujarati">
              <thead>
                <tr className="bg-amber-100/70 text-amber-950 border-b border-amber-200">
                  <th className="p-2.5 text-center w-12">ક્રમ</th>
                  <th className="p-2.5">કાર્યકરનું નામ</th>
                  <th className="p-2.5">પદવી (Milestone)</th>
                  <th className="p-2.5 text-center">કવર કરેલા કાર્યકરો</th>
                  <th className="p-2.5 text-right">લખેલા ગુણ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topWriters.map((writer, index) => (
                  <tr key={writer.authorId} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800">{writer.authorName}</td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {writer.badge.icon} {writer.badge.title}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-slate-600">
                      {writer.coveredCount} કાર્યકરો
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {writer.count} ગુણ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Virtue Compilation */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-gujarati">
              સર્વે ગુણોનું સંપુટ ({gunas.length} ગુણ)
            </h2>
            <span className="text-xs text-slate-400 font-gujarati print:hidden">
              A4 પ્રિન્ટ માટે યોગ્ય
            </span>
          </div>

          {/* Mode 1: Grouped by Recipient */}
          {viewMode === 'bapa-letter' && (
            <div className="space-y-6">
              {Object.entries(gunasByRecipient).map(([recipientName, items]) => (
                <div key={recipientName} className="page-break-inside-avoid space-y-2">
                  <div className="p-2 rounded-lg bg-slate-100 font-bold text-xs sm:text-sm text-slate-800 font-gujarati border-l-4 border-amber-500">
                    🌟 {recipientName} વિશે લખાયેલા ગુણો ({items.length})
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-2">
                    {items.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 page-break-inside-avoid"
                      >
                        <p className="text-xs sm:text-sm text-slate-800 font-gujarati leading-relaxed">
                          &ldquo;{g.content}&rdquo;
                        </p>
                        <div className="flex justify-between text-[11px] text-slate-500 font-gujarati pt-1 border-t border-slate-100">
                          <span>✍️ {g.author_name}</span>
                          <span>🙏 રાજીપો: {g.rajipo_count || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mode 2: Chronological Feed */}
          {viewMode === 'chronological' && (
            <div className="space-y-2.5">
              {gunas.map((g) => (
                <div
                  key={g.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 page-break-inside-avoid"
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700 font-gujarati">
                    <span>🌟 {g.recipient_name}</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(g.created_at).toLocaleDateString('gu-IN')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-gujarati leading-relaxed">
                    &ldquo;{g.content}&rdquo;
                  </p>
                  <div className="text-[11px] text-slate-500 font-gujarati pt-1 flex justify-between">
                    <span>✍️ {g.author_name}</span>
                    <span>🙏 રાજીપો: {g.rajipo_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mode 3: Grouped by Writer */}
          {viewMode === 'by-writer' && (
            <div className="space-y-6">
              {Object.entries(gunasByWriter).map(([authorName, items]) => (
                <div key={authorName} className="page-break-inside-avoid space-y-2">
                  <div className="p-2 rounded-lg bg-blue-50 font-bold text-xs sm:text-sm text-blue-900 font-gujarati border-l-4 border-blue-500 flex justify-between">
                    <span>✍️ {authorName} દ્વારા લખાયેલા ગુણો</span>
                    <span>({items.length} ગુણ)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-2">
                    {items.map((g) => (
                      <div
                        key={g.id}
                        className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 page-break-inside-avoid"
                      >
                        <div className="text-xs font-semibold text-amber-800 font-gujarati">
                          🌟 {g.recipient_name} નો ગુણ:
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-gujarati leading-relaxed">
                          &ldquo;{g.content}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sacred Footer */}
        <div className="pt-6 border-t border-amber-600/40 text-center text-xs text-slate-500 font-gujarati space-y-1">
          <p className="font-semibold text-amber-900">
            &ldquo;ગુણવાનના ગુણ ગાઈએ તો આપણામાં ગુણ આવે.&rdquo; — બ્રહ્મસ્વરૂપ યોગીજી મહારાજ
          </p>
          <p className="text-[11px] text-slate-400">
            રમતોત્સવ ૨૦૨૬ • ગુણગ્રહણ એપ • સ્વામિનારાયણ અક્ષરપીઠ
          </p>
        </div>
      </div>
    </div>
  );
}
