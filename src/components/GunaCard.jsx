'use client';

import React, { useState } from 'react';
import { Share2, Heart, Sparkles, Clock, Edit3, MessageCircle } from 'lucide-react';
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
  const [hasLiked, setHasLiked] = useState(() => {
    if (typeof window === 'undefined') return false;
    const likedList = JSON.parse(localStorage.getItem('gunagrahan_liked_ids') || '[]');
    return likedList.includes(guna.id);
  });
  const [likeCount, setLikeCount] = useState(guna.rajipo_count || 0);

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
      className={`p-4.5 sm:p-5 rounded-3xl bg-white border border-amber-900/10 shadow-[0_6px_24px_-4px_rgba(180,83,9,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(180,83,9,0.09)] transition-all duration-300 space-y-3.5 relative overflow-hidden group`}
    >
      {/* Decorative Warm Corner Tint */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-200/20 via-orange-100/10 to-transparent rounded-bl-full pointer-events-none" />

      {/* 1. Top Row: Recipient Pill & Relative Time */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100/90 to-amber-50 text-amber-950 border border-amber-300/80 font-gujarati shadow-2xs shrink-0">
            <span className="text-amber-600">🌟</span>
            <span>{guna.recipient_name} નો ગુણ</span>
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
      <div className="pl-3.5 sm:pl-4 pr-1 py-1 border-l-4 border-amber-500/90 relative">
        <p className="text-[15px] sm:text-[16px] text-stone-800 font-gujarati leading-[1.8] whitespace-pre-wrap selection:bg-amber-100 font-medium">
          &ldquo;{guna.content}&rdquo;
        </p>
      </div>

      {/* 3. Bottom Action Row */}
      <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 relative z-10">
        {/* Writer Attribution */}
        <div className="text-xs text-stone-500 font-gujarati truncate">
          <span className="text-amber-800/80 font-medium">✍️ લખનાર: </span>
          <span className="font-bold text-stone-800">
            {guna.author_name}
            {isMyWritten && (
              <span className="text-blue-700 font-extrabold ml-1">(તમે)</span>
            )}
          </span>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Edit Button for Author */}
          {isMyWritten && onEdit && (
            <button
              onClick={() => onEdit(guna)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/90 transition-all active:scale-95 font-gujarati shadow-2xs"
              title="ગુણ સુધારો (Edit)"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden xs:inline">સુધારો</span>
            </button>
          )}

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/90 transition-all active:scale-95 font-gujarati shadow-2xs"
            title="WhatsApp પર શેર કરો"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xs:inline">Share</span>
          </button>

          {/* Rajipo Appreciation Button */}
          <button
            onClick={handleRajipo}
            disabled={hasLiked}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 font-gujarati shadow-2xs ${
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
            <span>🙏 રાજીપો ({likeCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
