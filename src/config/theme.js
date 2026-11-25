// Dual-Wing Design Tokens (Bal vs Balika) - Handcrafted Spiritual Edition
export const getTheme = (wing = 'bal') => {
  const isBal = wing === 'bal';
  return {
    isBal,
    wing,
    wingLabelGujarati: isBal ? 'ક્ષેત્ર ૨૧ બાળ મંડળ' : 'ક્ષેત્ર ૨૧ બાલિકા મંડળ',
    // Warm Parchment & Ivory Backgrounds
    appBg: isBal ? 'bg-[#FAF7F2] text-[#1C1917]' : 'bg-[#FFF9F9] text-[#1C1917]',
    headerBg: isBal
      ? 'bg-[#FFFDF9] border-b border-amber-900/10 shadow-xs'
      : 'bg-[#FFFDF9] border-b border-rose-200/60 shadow-xs',
    // Royal Mandir Gradient Buttons
    primaryGradient: isBal
      ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98] border border-blue-400/20'
      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-900/20 active:scale-[0.98] border border-rose-300/30',
    primaryAccentText: isBal ? 'text-blue-700' : 'text-rose-600',
    primarySoftBg: isBal
      ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80'
      : 'bg-rose-50/80 text-rose-900 border border-rose-200/80',
    avatarBadge: isBal
      ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-amber-950 font-black border border-amber-300 shadow-2xs'
      : 'bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 text-white font-black border border-rose-300 shadow-2xs',
    // Warm Handcrafted Borders & Shadows
    cardBorder: 'border-amber-900/10',
    cardShadow: 'shadow-[0_10px_30px_-5px_rgba(180,83,9,0.06),0_4px_10px_-3px_rgba(180,83,9,0.03)]',
    quoteBorder: isBal ? 'border-l-4 border-amber-500' : 'border-l-4 border-rose-500',
    progressBarFill: isBal
      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
      : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600',
    goldGradient: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-amber-950 shadow-md shadow-amber-500/25',
    ringFocus: isBal
      ? 'focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600'
      : 'focus:ring-2 focus:ring-rose-500/30 focus:border-rose-600',
    pillActive: isBal
      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs font-bold'
      : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs font-bold',
    pillInactive: 'bg-amber-50/70 text-stone-600 hover:bg-amber-100/70 hover:text-stone-900 border border-amber-200/40',
  };
};
