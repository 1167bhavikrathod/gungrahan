'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, X, AlertCircle, Check, Sparkles } from 'lucide-react';
import { getFirstGrapheme } from '@/lib/utils';

export default function EditNameModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  theme,
}) {
  const [nameInput, setNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setNameInput(currentUser.name || '');
      setErrorMessage('');
      setIsSuccess(false);
      setIsSaving(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setErrorMessage('કૃપા કરીને તમારું નામ દાખલ કરો.');
      return;
    }

    if (trimmed.length < 2) {
      setErrorMessage('નામ ઓછામાં ઓછા ૨ અક્ષરનું હોવું જરૂરી છે.');
      return;
    }

    if (trimmed === currentUser.name) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      const success = await onSave(trimmed);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage('નામ અપડેટ કરવામાં મુશ્કેલી થઈ. ફરી પ્રયાસ કરો.');
      }
    } catch (err) {
      console.error('Failed to update name:', err);
      setErrorMessage('કંઈક ભૂલ થઈ. કૃપા કરીને ફરી પ્રયાસ કરો.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${theme.headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                theme.isBal
                  ? 'bg-gradient-to-br from-blue-700 to-indigo-800'
                  : 'bg-gradient-to-br from-rose-600 to-pink-700'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 font-gujarati">
                તમારું નામ સુધારો
              </h2>
              <p className="text-[11px] text-stone-500 font-gujarati">
                પ્રોફાઇલ નામ અને ઓળખ અપડેટ કરો
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Current Profile Card */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-xs shrink-0 ${theme.avatarBadge}`}
            >
              {getFirstGrapheme(currentUser.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-amber-900/70 font-semibold font-gujarati">
                હાલનું નામ:
              </p>
              <p className="font-bold text-sm text-stone-900 font-gujarati truncate">
                {currentUser.name}
              </p>
              {(currentUser.karyakar_number || currentUser.sabha) && (
                <p className="text-[11px] text-amber-900/80 font-gujarati mt-0.5">
                  {currentUser.karyakar_number ? `નંબર: ${currentUser.karyakar_number}` : ''}
                  {currentUser.karyakar_number && currentUser.sabha ? ' • ' : ''}
                  {currentUser.sabha || ''}
                </p>
              )}
            </div>
          </div>

          {/* New Name Input Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-user-name-input"
              className="text-xs font-bold text-stone-700 font-gujarati block"
            >
              નવું અથવા સુધારેલું નામ:
            </label>
            <div className="relative">
              <input
                id="edit-user-name-input"
                ref={inputRef}
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="દા.ત. તીર્થ શૈલેષભાઈ પરમાર (tirth)"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-sm font-gujarati font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition shadow-inner"
                maxLength={60}
                required
              />
            </div>

            <p className="text-[11px] text-stone-500 font-gujarati leading-relaxed">
              💡 તમે તમારું પૂરું નામ અથવા કૌંસમાં ઉપનામ લખી શકો છો (દા.ત. <span className="font-bold text-stone-700">તીર્થ શૈલેષભાઈ પરમાર (tirth)</span>). આ નામ એપમાં તમારા લખેલા ગુણ અને લીડરબોર્ડમાં જોવા મળશે.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 font-gujarati flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 font-gujarati flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>નામ સફળતાપૂર્વક અપડેટ થયું!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-xs sm:text-sm font-gujarati transition"
            >
              રદ કરો
            </button>

            <button
              type="submit"
              disabled={isSaving || !nameInput.trim()}
              className={`flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition active:scale-[0.98] disabled:opacity-50 shadow-md ${theme.primaryGradient}`}
            >
              {isSaving ? (
                <span className="font-gujarati text-white">સાચવી રહ્યું છે...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-200" />
                  <span className="font-gujarati text-white">નામ સાચવો</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
