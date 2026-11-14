'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserPlus, Search, ArrowLeft, KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import TilakChandlo from '@/components/TilakChandlo';
import { getFirstGrapheme } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function LoginGateModal({ karyakars = [], onSelectUser, wing, theme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKaryakar, setSelectedKaryakar] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Karyakar Creation State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newKaryakarNumber, setNewKaryakarNumber] = useState('');

  const passwordInputRef = useRef(null);

  // Focus password input when karyakar is selected
  useEffect(() => {
    if (selectedKaryakar && passwordInputRef.current) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [selectedKaryakar]);

  // Filter karyakars matching the search query
  const filteredKaryakars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return karyakars;
    return karyakars.filter((k) => {
      const matchName = k.name.toLowerCase().includes(q);
      const matchNumber = k.karyakar_number && k.karyakar_number.includes(q);
      const matchSabha = k.sabha && k.sabha.toLowerCase().includes(q);
      return matchName || matchNumber || matchSabha;
    });
  }, [karyakars, searchQuery]);

  // Check if current search query already has an exact match
  const hasExactMatch = useMemo(() => {
    const cleanQ = searchQuery.trim().toLowerCase();
    return karyakars.some((k) => k.name.toLowerCase() === cleanQ);
  }, [karyakars, searchQuery]);

  // Step 1: User taps their name
  const handleSelectName = (karyakar) => {
    setSelectedKaryakar(karyakar);
    setPasswordInput('');
    setErrorMessage('');
    setIsCreatingNew(false);
  };

  // Step 2: User verifies their Karyakar Number password
  const handleVerifyPassword = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanInput = passwordInput.trim();
    if (!cleanInput) {
      setErrorMessage('કૃપા કરીને તમારો કાર્યકર નંબર દાખલ કરો.');
      return;
    }

    const expectedNumber = selectedKaryakar?.karyakar_number?.trim();

    if (expectedNumber) {
      if (cleanInput === expectedNumber) {
        onSelectUser(selectedKaryakar);
      } else {
        setErrorMessage('ખોટો કાર્યકર નંબર! કૃપા કરીને તમારો સત્તાવાર નંબર દાખલ કરો.');
        setPasswordInput('');
      }
    } else {
      // If karyakar did not have a number in Excel, accept their entered number
      const updatedUser = {
        ...selectedKaryakar,
        karyakar_number: cleanInput,
      };
      onSelectUser(updatedUser);
    }
  };

  // Handle creating an unregistered Karyakar with their number
  const handleCreateNewKaryakar = async (e) => {
    e.preventDefault();
    const cleanName = searchQuery.trim();
    const cleanNumber = newKaryakarNumber.trim();

    if (cleanName.length < 2) {
      setErrorMessage('કૃપા કરીને પૂરું નામ લખો.');
      return;
    }

    if (!cleanNumber || cleanNumber.length < 3) {
      setErrorMessage('કૃપા કરીને માન્ય કાર્યકર નંબર (ઓછામાં ઓછા ૩ અંક) દાખલ કરો.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let createdUser = null;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('karyakars')
          .insert({
            name: cleanName,
            karyakar_number: cleanNumber,
            wing: wing,
            is_pre_registered: false,
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert error, falling back locally:', error.message);
          createdUser = {
            id: `temp-${Date.now()}`,
            name: cleanName,
            karyakar_number: cleanNumber,
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
          karyakar_number: cleanNumber,
          wing: wing,
          is_pre_registered: false,
        };
      }

      onSelectUser(createdUser);
    } catch (err) {
      console.error('Failed to create karyakar:', err);
      setErrorMessage('કાર્યકર ઉમેરવામાં સમસ્યા આવી. ફરી પ્રયાસ કરો.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Card */}
        <div
          className={`p-5 text-center relative ${
            theme.isBal
              ? 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 text-white'
              : 'bg-gradient-to-br from-rose-600 via-pink-700 to-rose-800 text-white'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold mb-2 border border-white/20">
            <TilakChandlo className="w-4 h-4" />
            <span className="font-gujarati text-amber-100">ગુણના ભિખારી બનીએ • રમતોત્સવ ૨૦૨૬</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">ગુણગ્રહણ એપ</h1>
          <p className="text-xs text-amber-100/90 mt-0.5 max-w-xs mx-auto font-gujarati">
            {selectedKaryakar
              ? 'કાર્યકર વેરિફિકેશન • સુરક્ષિત લોગિન'
              : isCreatingNew
              ? 'નવો કાર્યકર નોંધણી'
              : 'તમારું નામ પસંદ કરો અને કાર્યકર નંબરથી લોગિન કરો.'}
          </p>
        </div>

        {/* VIEW 1: PASSWORD PIN VERIFICATION */}
        {selectedKaryakar ? (
          <form onSubmit={handleVerifyPassword} className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedKaryakar(null);
                setPasswordInput('');
                setErrorMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition font-gujarati group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>બીજું નામ પસંદ કરો</span>
            </button>

            {/* Selected Karyakar Identity Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center gap-3 shadow-2xs">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-xs shrink-0 ${theme.avatarBadge}`}
              >
                {getFirstGrapheme(selectedKaryakar.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-base text-stone-900 font-gujarati truncate">
                  {selectedKaryakar.name}
                </h3>
                {(selectedKaryakar.role || selectedKaryakar.sabha) && (
                  <p className="text-xs text-amber-900/80 font-gujarati truncate">
                    {selectedKaryakar.role} {selectedKaryakar.sabha ? `• ${selectedKaryakar.sabha}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Password PIN Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="karyakar-password-input"
                className="flex items-center justify-between text-xs font-bold text-stone-700 font-gujarati"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  તમારો કાર્યકર નંબર (Password) દાખલ કરો:
                </span>
              </label>

              <div className="relative">
                <input
                  id="karyakar-password-input"
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="દા.ત. 21158"
                  className="w-full pl-4 pr-11 py-3 text-center text-lg font-mono font-bold tracking-widest bg-stone-50/90 border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-stone-500 font-gujarati text-center">
                ક્ષેત્ર ૨૧ ના સત્તાવાર લિસ્ટ મુજબનો કાર્યકર નંબર
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 font-gujarati text-center animate-shake">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!passwordInput.trim()}
                className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${theme.primaryGradient}`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span className="font-gujarati text-white">વેરિફાય કરો અને લોગિન કરો</span>
              </button>
            </div>
          </form>
        ) : isCreatingNew ? (
          /* VIEW 2: NEW KARYAKAR REGISTRATION WITH PASSWORD */
          <form onSubmit={handleCreateNewKaryakar} className="p-5 space-y-4 flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setErrorMessage('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition font-gujarati"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>લિસ્ટ પર પાછા જાઓ</span>
            </button>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 font-gujarati block mb-1">
                  કાર્યકરનું પૂરું નામ:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="દા.ત. રમેશભાઈ પટેલ"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-gujarati focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 font-gujarati block mb-1">
                  કાર્યકર નંબર (Password તરીકે વપરાશે):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newKaryakarNumber}
                  onChange={(e) => setNewKaryakarNumber(e.target.value)}
                  placeholder="તમારો કાર્યકર નંબર..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 font-gujarati text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || searchQuery.trim().length < 2 || !newKaryakarNumber.trim()}
              className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98] disabled:opacity-50 shadow-md ${theme.primaryGradient}`}
            >
              <UserPlus className="w-4 h-4 text-amber-200" />
              <span className="font-gujarati text-white">
                {isSubmitting ? 'નોંધણી થઈ રહી છે...' : 'નોંધણી કરીને લોગિન કરો'}
              </span>
            </button>
          </form>
        ) : (
          /* VIEW 3: KARYAKAR LIST SELECTION */
          <>
            {/* Search Input */}
            <div className="p-3.5 border-b border-amber-100 bg-amber-50/40">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="તમારું નામ કે કાર્યકર નંબર શોધો..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-gujarati placeholder:text-stone-400 transition shadow-2xs"
                  autoFocus
                />
              </div>
            </div>

            {/* Karyakar List (31 Official Karyakars) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-72">
              {filteredKaryakars.length > 0 ? (
                filteredKaryakars.map((karyakar) => {
                  const initial = getFirstGrapheme(karyakar.name);
                  return (
                    <button
                      key={karyakar.id}
                      onClick={() => handleSelectName(karyakar)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-amber-50/80 active:scale-[0.99] text-left transition group border border-transparent hover:border-amber-200"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-2xs shrink-0 select-none ${theme.avatarBadge}`}
                      >
                        {initial}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-amber-900 transition font-gujarati">
                          {karyakar.name}
                        </p>
                        <p className="text-[11px] text-stone-500 font-gujarati truncate">
                          {karyakar.role || 'કાર્યકર'} {karyakar.sabha ? `• ${karyakar.sabha}` : ''}
                        </p>
                      </div>

                      {/* Lock / PIN hint indicator */}
                      <span className="text-[10px] text-amber-800 bg-amber-100/80 border border-amber-300/60 px-2 py-0.5 rounded-full font-bold font-gujarati shrink-0 opacity-80 group-hover:opacity-100">
                        PIN
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-stone-500 text-sm font-gujarati space-y-2">
                  <p>આ નામ લિસ્ટમાં મળ્યું નહીં.</p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="text-xs font-bold text-amber-800 underline"
                  >
                    + નવો કાર્યકર ઉમેરો
                  </button>
                </div>
              )}
            </div>

            {/* Unregistered Karyakar Inline Creator */}
            {searchQuery.trim().length >= 2 && !hasExactMatch && (
              <div className="p-3 border-t border-amber-100 bg-amber-50/60">
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-2xs transition active:scale-[0.98] ${theme.primaryGradient}`}
                >
                  <UserPlus className="w-4 h-4 text-amber-200" />
                  <span className="font-gujarati text-white">
                    &quot;{searchQuery.trim()}&quot; નવું નામ ઉમેરો
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="p-3 text-center text-[11px] text-amber-900/60 border-t border-stone-100 font-gujarati bg-stone-50/40">
          ॥ શ્રી સ્વામિનારાયણો વિજયતેતરામ્ ॥ • સંપ અને સુહ્રદભાવ અભિયાન
        </div>
      </div>
    </div>
  );
}
