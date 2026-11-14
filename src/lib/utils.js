// Helper Utilities for Gunagrahan WebApp

/**
 * 1. getFirstGrapheme(name)
 * Uses Intl.Segmenter with granularity 'grapheme' so Gujarati conjuncts/matras
 * like "સિ", "ભ", "ઋ" remain intact as a single grapheme cluster.
 */
export function getFirstGrapheme(name) {
  if (!name || typeof name !== 'string') return '?';
  const cleanName = name.trim();
  if (!cleanName) return '?';

  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('gu', { granularity: 'grapheme' });
      const segments = segmenter.segment(cleanName);
      for (const seg of segments) {
        if (seg.segment && seg.segment.trim().length > 0) {
          return seg.segment.trim();
        }
      }
    }
  } catch (e) {
    // Fallback if Intl.Segmenter is unavailable
  }

  const chars = Array.from(cleanName);
  return chars[0] || '?';
}

/**
 * 2. formatRelativeTime(dateString)
 * Relative time formatter in Gujarati
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'હમણાં જ';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'હમણાં જ';
  }

  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) {
    return `${mins} મિનિટ પહેલાં`;
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours} કલાક પહેલાં`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} દિવસ પહેલાં`;
  }

  // DD MMM, hh:mm A
  const months = ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગ', 'સપ્ટે', 'ઓક્ટો', 'નવે', 'ડિસે'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  let hr = date.getHours();
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12;
  hr = hr ? hr : 12;
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month}, ${hr}:${minute} ${ampm}`;
}

/**
 * 3. getWriterBadge(count)
 * Prestige gamification title based on written count
 */
export function getWriterBadge(count = 0) {
  const num = Number(count) || 0;
  if (num >= 50) {
    return {
      icon: '👑',
      title: 'સંપ શિલ્પી',
      level: 4,
      targetNext: null,
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }
  if (num >= 25) {
    return {
      icon: '💎',
      title: 'ગુણના ભિખારી',
      level: 3,
      targetNext: 50,
      nextTitle: 'સંપ શિલ્પી',
      colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
    };
  }
  if (num >= 10) {
    return {
      icon: '✨',
      title: 'ગુણ ગ્રાહક',
      level: 2,
      targetNext: 25,
      nextTitle: 'ગુણના ભિખારી',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }
  if (num >= 1) {
    return {
      icon: '🌱',
      title: 'ગુણ શોધક',
      level: 1,
      targetNext: 10,
      nextTitle: 'ગુણ ગ્રાહક',
      colorClass: 'bg-sky-100 text-sky-800 border-sky-300',
    };
  }
  return {
    icon: '🌸',
    title: 'નવા લેખક',
    level: 0,
    targetNext: 1,
    nextTitle: 'ગુણ શોધક',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
  };
}

/**
 * 4. buildWhatsAppShareUrl(guna, appUrl)
 * Constructs 1-tap WhatsApp deep link
 */
export function buildWhatsAppShareUrl(guna, appUrl = '') {
  if (!guna) return '#';
  const url = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const text = `🌟 *${guna.recipient_name}નો ગુણ*\n\n"${guna.content}"\n\n✍️ *લખનાર:* ${guna.author_name}\n🔗 *રમતોત્સવ ગુણગ્રહણ એપ પર ગુણ વાંચો અને લખો:* ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Helper to get motivational text for the next milestone badge
 */
export function getNextBadgeMotivation(count = 0, rank = null) {
  const badge = getWriterBadge(count);
  const rankStr = rank ? `તમારો ક્રમ #${rank} છે. ` : '';
  if (!badge.targetNext) {
    return `🌟 ${rankStr}અદ્ભુત! તમે સર્વોચ્ચ '👑 સંપ શિલ્પી' પદ પર છો!`;
  }
  const remaining = badge.targetNext - count;
  return `🌟 ${rankStr}'${badge.nextTitle}' બનવા બીજા ${remaining} ગુણ લખો!`;
}
