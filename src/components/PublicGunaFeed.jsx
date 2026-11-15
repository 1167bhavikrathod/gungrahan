'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, MessageSquareQuote } from 'lucide-react';
import GunaCard from './GunaCard';

export default function PublicGunaFeed({
  gunas = [],
  karyakars = [],
  currentUserId,
  theme,
  onRajipoIncrement,
  onEdit,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my-written' | 'about-me'
  const [selectedKaryakarId, setSelectedKaryakarId] = useState('');
  const [contentSearch, setContentSearch] = useState('');

  // Counts for tabs
  const myWrittenCount = useMemo(() => {
    return gunas.filter((g) => g.author_id === currentUserId).length;
  }, [gunas, currentUserId]);

  const forMeCount = useMemo(() => {
    return gunas.filter((g) => g.recipient_id === currentUserId).length;
  }, [gunas, currentUserId]);

  // Filtered gunas
  const filteredGunas = useMemo(() => {
    let result = [...gunas];

    // Tab filter
    if (activeTab === 'my-written') {
      result = result.filter((g) => g.author_id === currentUserId);
    } else if (activeTab === 'about-me') {
      result = result.filter((g) => g.recipient_id === currentUserId);
    }

    // Specific karyakar filter (either recipient or author)
    if (selectedKaryakarId) {
      result = result.filter(
        (g) => g.recipient_id === selectedKaryakarId || g.author_id === selectedKaryakarId
      );
    }

    // Keyword search in content
    if (contentSearch.trim()) {
      const q = contentSearch.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.content.toLowerCase().includes(q) ||
          g.author_name.toLowerCase().includes(q) ||
          g.recipient_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [gunas, activeTab, selectedKaryakarId, contentSearch, currentUserId]);

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className={`p-4 rounded-3xl bg-white border ${theme.cardBorder} shadow-sm space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-base text-stone-900 font-gujarati">
              ગુણ વાણી
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-500 font-gujarati">
            {filteredGunas.length} ગુણ
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-50/70 border border-amber-900/10 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[85px] sm:min-w-[100px] py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition font-gujarati text-center whitespace-nowrap shrink-0 sm:shrink ${
              activeTab === 'all'
                ? theme.pillActive
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
            }`}
          >
            બધા ગુણો ({gunas.length})
          </button>

          <button
            onClick={() => setActiveTab('my-written')}
            className={`flex-1 min-w-[85px] sm:min-w-[100px] py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition font-gujarati text-center whitespace-nowrap shrink-0 sm:shrink ${
              activeTab === 'my-written'
                ? theme.pillActive
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
            }`}
          >
            મેં લખેલા ({myWrittenCount})
          </button>

          <button
            onClick={() => setActiveTab('about-me')}
            className={`flex-1 min-w-[85px] sm:min-w-[100px] py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition font-gujarati text-center whitespace-nowrap shrink-0 sm:shrink ${
              activeTab === 'about-me'
                ? theme.pillActive
                : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
            }`}
          >
            મારા વિશે ({forMeCount})
          </button>
        </div>

        {/* Search & Karyakar Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
              placeholder="ગુણમાં શોધો..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50/80 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400"
            />
          </div>

          {/* Karyakar Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <select
              value={selectedKaryakarId}
              onChange={(e) => setSelectedKaryakarId(e.target.value)}
              aria-label="કાર્યકર પ્રમાણે ફિલ્ટર કરો"
              className="w-full pl-9 pr-8 py-2 bg-stone-50/80 rounded-xl border border-stone-200 text-xs sm:text-sm font-gujarati text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer"
            >
              <option value="">🔍 બધા કાર્યકરો...</option>
              {karyakars.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed Cards List */}
      <div className="space-y-3">
        {filteredGunas.length > 0 ? (
          filteredGunas.map((guna) => (
            <GunaCard
              key={guna.id}
              guna={guna}
              isMyWritten={guna.author_id === currentUserId}
              isAboutMe={guna.recipient_id === currentUserId}
              theme={theme}
              onRajipoIncrement={onRajipoIncrement}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
            <p className="text-sm font-semibold text-slate-700 font-gujarati">
              કોઈ ગુણ મળ્યા નહીં.
            </p>
            <p className="text-xs text-slate-400 font-gujarati">
              તમે પસંદ કરેલા ફિલ્ટરમાં હજુ સુધી કોઈ ગુણ ઉમેરાયા નથી.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
