'use client';

import React, { useState } from 'react';
import { Share2, Heart, Sparkles, Clock, Check } from 'lucide-react';
import { formatRelativeTime, buildWhatsAppShareUrl } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function GunaCard({
  guna,
  isMyWritten = false,
  isAboutMe = false,
  theme,
  onRajipoIncrement,
}) {
  const [hasLiked, setHasLiked] = useState(() => {
    if (typeof window === 'undefined') return false;
    const likedList = JSON.parse(localStorage.getItem('gunagrahan_liked_ids') || '[]');
    return likedList.includes(guna.id);
  });
  const [likeCount, setLikeCount] = useState(guna.rajipo_count || 0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Handle Rajipo button tap
  const handleRajipo = async () => {
    if (hasLiked) return;

    // Optimistic UI update
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
      className={`p-4 sm:p-5 rounded-3xl bg-white border ${theme.cardBorder} shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5`}
    >
      {/* 1. Top Row: Recipient & Time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 font-gujarati shrink-0">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>🌟 {guna.recipient_name} નો ગુણ</span>
          </div>

          {isAboutMe && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold font-gujarati">
              તમારા વિશે
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-gujarati shrink-0">
          <Clock className="w-3 h-3 text-slate-300" />
          <span>{formatRelativeTime(guna.created_at)}</span>
        </div>
      </div>

      {/* 2. Middle Content: Gujarati Virtue Text */}
      <div className={`pl-3.5 pr-2 py-1 ${theme.quoteBorder}`}>
        <p className="text-[15px] sm:text-[16px] text-slate-800 font-gujarati leading-relaxed whitespace-pre-wrap selection:bg-amber-100">
          &ldquo;{guna.content}&rdquo;
        </p>
      </div>

      {/* 3. Bottom Action Row */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Writer Attribution */}
        <div className="text-xs text-slate-500 font-gujarati truncate">
          <span>✍️ લખનાર: </span>
          <span className="font-semibold text-slate-700">
            {guna.author_name}
            {isMyWritten && (
              <span className="text-blue-600 font-bold ml-1">(તમે)</span>
            )}
          </span>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* WhatsApp Share Button (Enhancement #5) */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95 font-gujarati"
            title="WhatsApp પર શેર કરો"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Share</span>
          </button>

          {/* Rajipo Appreciation Button */}
          <button
            onClick={handleRajipo}
            disabled={hasLiked}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 font-gujarati ${
              hasLiked
                ? 'bg-rose-50 text-rose-600 border-rose-200 cursor-default'
                : 'bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border-slate-200'
            }`}
            title="રાજીપો દર્શાવો"
          >
            <Heart
              className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-500'}`}
            />
            <span>🙏 રાજીપો ({likeCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
