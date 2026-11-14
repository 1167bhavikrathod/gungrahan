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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Card - Sacred Saffron & Royal Mandir Blue */}
        <div
          className={`p-6 pb-5 text-center ${
            theme.isBal
              ? 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 text-white'
              : 'bg-gradient-to-br from-rose-600 via-pink-700 to-rose-800 text-white'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-gujarati text-amber-100">✨ ગુણના ભિખારી બનીએ • રમતોત્સવ ૨૦૨૬</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">ગુણગ્રહણ એપ</h1>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xs mx-auto font-gujarati">
            તમારું નામ પસંદ કરો અને કાર્યકરોના ગુણ લખવાની શરૂઆત કરો.
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-amber-100 bg-amber-50/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="તમારું નામ શોધો અથવા લખો..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-gujarati placeholder:text-stone-400 transition shadow-2xs"
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
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-amber-50/80 active:scale-[0.99] text-left transition group border border-transparent hover:border-amber-200"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shadow-2xs shrink-0 ${theme.avatarBadge}`}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate group-hover:text-amber-900 transition font-gujarati">
                      {karyakar.name}
                    </p>
                    {!karyakar.is_pre_registered && (
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                        નવો કાર્યકર
                      </span>
                    )}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-amber-500 transition opacity-0 group-hover:opacity-100" />
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-stone-500 text-sm font-gujarati">
              કોઈ કાર્યકર મળ્યા નહીં.
            </div>
          )}
        </div>

        {/* Unregistered Karyakar Inline Creator */}
        {searchQuery.trim().length >= 2 && !hasExactMatch && (
          <div className="p-3 border-t border-amber-100 bg-amber-50/60">
            <button
              onClick={handleCreateNewKaryakar}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition active:scale-[0.98] ${theme.primaryGradient}`}
            >
              <UserPlus className="w-4 h-4 text-amber-200" />
              <span className="font-gujarati text-white">
                + &quot;{searchQuery.trim()}&quot; નવું નામ ઉમેરીને લોગિન કરો
              </span>
            </button>
          </div>
        )}

        <div className="p-3 text-center text-[11px] text-amber-900/60 border-t border-stone-100 font-gujarati">
          ॥ શ્રી સ્વામિનારાયણો વિજયતેતરામ્ ॥ • સંપ અને સુહ્રદભાવ અભિયાન
        </div>
      </div>
    </div>
  );
}
