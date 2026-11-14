'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, UserPlus, Search, CheckCircle2 } from 'lucide-react';
import { getFirstGrapheme } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function LoginGateModal({ karyakars, onSelectUser, wing, theme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter karyakars matching the search query
  const filteredKaryakars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return karyakars;
    return karyakars.filter(k => k.name.toLowerCase().includes(q));
  }, [karyakars, searchQuery]);

  // Check if current search query already has an exact match
  const hasExactMatch = useMemo(() => {
    const cleanQ = searchQuery.trim().toLowerCase();
    return karyakars.some(k => k.name.toLowerCase() === cleanQ);
  }, [karyakars, searchQuery]);

  // Handle selecting an existing Karyakar
  const handleSelect = (karyakar) => {
    onSelectUser(karyakar);
  };

  // Handle creating an unregistered Karyakar and logging in
  const handleCreateNewKaryakar = async () => {
    const cleanName = searchQuery.trim();
    if (cleanName.length < 2 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let createdUser = null;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('karyakars')
          .insert({
            name: cleanName,
            wing: wing,
            is_pre_registered: false,
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert karyakar error, falling back:', error.message);
          // If already exists or error, create fallback user object
          createdUser = {
            id: `temp-${Date.now()}`,
            name: cleanName,
            wing: wing,
            is_pre_registered: false,
          };
        } else {
          createdUser = data;
        }
      } else {
        // Local mode
        createdUser = {
          id: `local-${Date.now()}`,
          name: cleanName,
          wing: wing,
          is_pre_registered: false,
        };
      }

      onSelectUser(createdUser);
    } catch (err) {
      console.error('Failed to create karyakar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Card */}
        <div className={`p-6 pb-5 text-center ${theme.isBal ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white' : 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white'}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>✨ ગુણના ભિખારી બનીએ • રમતોત્સવ</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ગુણગ્રહણ એપ</h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xs mx-auto font-gujarati">
            તમારું નામ પસંદ કરો અને કાર્યકરોના ગુણ લખવાની શરૂઆત કરો.
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="તમારું નામ શોધો અથવા લખો..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-gujarati placeholder:text-slate-400 transition"
              autoFocus
            />
          </div>
        </div>

        {/* Karyakar List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-64 sm:max-h-72">
          {filteredKaryakars.length > 0 ? (
            filteredKaryakars.map((karyakar) => {
              const initial = getFirstGrapheme(karyakar.name);
              return (
                <button
                  key={karyakar.id}
                  onClick={() => handleSelect(karyakar)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-slate-100 active:scale-[0.99] text-left transition group border border-transparent hover:border-slate-200"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${theme.avatarBadge}`}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition font-gujarati">
                      {karyakar.name}
                    </p>
                    {!karyakar.is_pre_registered && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        નવો કાર્યકર
                      </span>
                    )}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition opacity-0 group-hover:opacity-100" />
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm font-gujarati">
              કોઈ કાર્યકર મળ્યા નહીં.
            </div>
          )}
        </div>

        {/* Unregistered Karyakar Inline Creator */}
        {searchQuery.trim().length >= 2 && !hasExactMatch && (
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleCreateNewKaryakar}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${theme.primaryGradient}`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-gujarati">
                + &quot;{searchQuery.trim()}&quot; નવું નામ ઉમેરીને લોગિન કરો
              </span>
            </button>
          </div>
        )}

        <div className="p-3 text-center text-[11px] text-slate-400 border-t border-slate-100">
          રમતોત્સવ ૨૦૨૬ • સંપ અને સુહ્રદભાવ અભિયાન
        </div>
      </div>
    </div>
  );
}
