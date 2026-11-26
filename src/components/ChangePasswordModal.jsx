'use client';

import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { getFirstGrapheme } from '@/lib/utils';

export default function ChangePasswordModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  theme,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const firstInputRef = useRef(null);
  const wasOpenRef = useRef(false);

  const hasExistingPassword = Boolean(String(currentUser?.karyakar_number || '').trim());

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && currentUser) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setErrorMessage('');
      setIsSuccess(false);
      setIsSaving(false);
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (hasExistingPassword && !cleanCurrent) {
      setErrorMessage('કૃપા કરીને હાલનો પાસવર્ડ (કાર્યકર નંબર) દાખલ કરો.');
      return;
    }

    if (cleanNew.length < 3) {
      setErrorMessage('નવો પાસવર્ડ ઓછામાં ઓછા ૩ અક્ષર/અંકનો હોવો જરૂરી છે.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMessage('બંને નવા પાસવર્ડ એકસરખા નથી. ફરી તપાસો.');
      return;
    }

    if (hasExistingPassword && cleanNew === cleanCurrent) {
      setErrorMessage('નવો પાસવર્ડ હાલના પાસવર્ડથી અલગ રાખો.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      const res = await onSave(cleanCurrent, cleanNew);
      if (res?.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setErrorMessage(
          res?.error || 'પાસવર્ડ બદલવામાં મુશ્કેલી થઈ. ફરી પ્રયાસ કરો.'
        );
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      setErrorMessage('કંઈક ભૂલ થઈ. કૃપા કરીને ફરી પ્રયાસ કરો.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65">
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
              <KeyRound className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 font-gujarati">
                પાસવર્ડ / નંબર બદલો
              </h2>
              <p className="text-[11px] text-stone-500 font-gujarati">
                લોગિન માટે તમારો નવો પાસવર્ડ સેટ કરો
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* User Banner */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-xs shrink-0 ${theme.avatarBadge}`}
            >
              {getFirstGrapheme(currentUser.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-stone-900 font-gujarati truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-amber-900/75 font-gujarati">
                પાસવર્ડ બદલ્યા પછી નવા પાસવર્ડથી લોગિન કરી શકાશે
              </p>
            </div>
          </div>

          {hasExistingPassword && (
            <div className="space-y-1.5">
              <label
                htmlFor="current-password-input"
                className="text-xs font-bold text-stone-700 font-gujarati block"
              >
                હાલનો પાસવર્ડ (કાર્યકર નંબર):
              </label>
              <div className="relative">
                <input
                  id="current-password-input"
                  ref={firstInputRef}
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="હાલનો પાસવર્ડ લખો"
                  className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="new-password-input"
              className="text-xs font-bold text-stone-700 font-gujarati block"
            >
              નવો પાસવર્ડ (ઓછામાં ઓછા ૩ અક્ષર/અંક):
            </label>
            <div className="relative">
              <input
                id="new-password-input"
                ref={hasExistingPassword ? undefined : firstInputRef}
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="નવો પાસવર્ડ લખો"
                className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition"
                maxLength={40}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                aria-label="Toggle new password visibility"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password-input"
              className="text-xs font-bold text-stone-700 font-gujarati block"
            >
              નવો પાસવર્ડ ફરી લખો (Confirm):
            </label>
            <input
              id="confirm-password-input"
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="નવો પાસવર્ડ ફરી લખો"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition"
              maxLength={40}
              required
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 font-gujarati flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 font-gujarati flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>પાસવર્ડ સફળતાપૂર્વક બદલાયો!</span>
            </div>
          )}

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
              disabled={isSaving || newPassword.trim().length < 3 || !confirmPassword.trim()}
              className={`flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition active:scale-[0.98] disabled:opacity-50 shadow-md ${theme.primaryGradient}`}
            >
              {isSaving ? (
                <span className="font-gujarati text-white">બદલાઈ રહ્યું છે...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-200" />
                  <span className="font-gujarati text-white">પાસવર્ડ સાચવો</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
