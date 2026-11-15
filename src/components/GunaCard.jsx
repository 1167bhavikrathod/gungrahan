'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Heart, Clock, Edit3, PenLine } from 'lucide-react';
import { formatRelativeTime, buildWhatsAppShareUrl } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function GunaCard({
  guna,
  isMyWritten = false,
  isAboutMe = false,
  theme,
  onRajipoIncrement,
  onEdit,
}) {
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(guna.rajipo_count || 0);

  // Sync like state from localStorage on client mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const likedList = JSON.parse(localStorage.getItem('gunagrahan_liked_ids') || '[]');
      if (likedList.includes(guna.id)) {
        setHasLiked(true);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [guna.id]);

  // Handle Rajipo button tap
  const handleRajipo = async () => {
    if (hasLiked) return;

    setHasLiked(true);
    setLikeCount((prev) => prev + 1);

    try {
      const likedList = JSON.parse(localStorage.getItem('gunagrahan_liked_ids') || '[]');
      if (!likedList.includes(guna.id)) {
        likedList.push(guna.id);
        localStorage.setItem('gunagrahan_liked_ids', JSON.stringify(likedList));
      }

      if (isSupabaseConfigured) {
        await supabase.rpc('increment_rajipo', { row_id: guna.id });
      }

      if (onRajipoIncrement) {
        onRajipoIncrement(guna.id);
      }
    } catch (err) {
      console.error('Error incrementing rajipo:', err);
    }
  };

  // Handle WhatsApp Share
  const handleShare = () => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = buildWhatsAppShareUrl(guna, appUrl);
    window.open(shareUrl, '_blank');
  };

  return (
    <div
      className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-900/10 shadow-[0_4px_20px_-4px_rgba(180,83,9,0.05)] hover:shadow-[0_8px_25px_-4px_rgba(180,83,9,0.08)] transition-all duration-200 space-y-3 relative overflow-hidden group"
    >
      {/* 1. Top Row: Recipient Pill & Relative Time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200/90 font-gujarati shrink min-w-0 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">{guna.recipient_name} નો ગુણ</span>
          </div>

          {isAboutMe && (
            <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2 py-0.5 rounded-full font-bold font-gujarati shrink-0">
              તમારા વિશે
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-stone-400 font-gujarati shrink-0">
          <Clock className="w-3 h-3 text-stone-300" />
          <span>{formatRelativeTime(guna.created_at)}</span>
        </div>
      </div>

      {/* 2. Middle Content: Calligraphic Virtue Scroll Body */}
      <div className="pl-3.5 sm:pl-4 pr-1 py-1 border-l-4 border-amber-500/90">
        <p className="text-[15px] sm:text-[16px] text-stone-800 font-gujarati leading-[1.8] whitespace-pre-wrap font-medium">
          &ldquo;{guna.content}&rdquo;
        </p>
      </div>

      {/* 3. Bottom Action Row: Balanced and Non-Crowding */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Writer Attribution */}
        <div className="flex items-center gap-1 text-xs text-stone-500 font-gujarati min-w-0 shrink">
          <PenLine className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="text-amber-900/80 font-medium shrink-0">લખનાર:</span>
          <span className="font-bold text-stone-800 truncate">
            {guna.author_name}
          </span>
          {isMyWritten && (
            <span className="text-blue-700 font-bold shrink-0">(તમે)</span>
          )}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Edit Button for Author */}
          {isMyWritten && onEdit && (
            <button
              onClick={() => onEdit(guna)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/90 transition-all active:scale-95 shadow-2xs"
              title="ગુણ સુધારો"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            </button>
          )}

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/90 transition-all active:scale-95 shadow-2xs"
            title="WhatsApp પર શેર કરો"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          {/* Rajipo Appreciation Button */}
          <button
            onClick={handleRajipo}
            disabled={hasLiked}
            className={`h-8 px-2 sm:px-2.5 rounded-xl flex items-center gap-1 sm:gap-1.5 text-xs font-bold border transition-all active:scale-95 shadow-2xs font-gujarati ${
              hasLiked
                ? 'bg-rose-50 text-rose-700 border-rose-200 cursor-default'
                : 'bg-stone-50 text-stone-700 hover:bg-rose-50 hover:text-rose-700 border-stone-200/90'
            }`}
            title="રાજીપો દર્શાવો"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${
                hasLiked
                  ? 'fill-rose-500 text-rose-500 scale-110'
                  : 'text-stone-400 group-hover:text-rose-500'
              }`}
            />
            <span className="whitespace-nowrap">રાજીપો ({likeCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
