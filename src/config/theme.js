// Dual-Wing Design Tokens (Bal vs Balika)
export const getTheme = (wing = 'bal') => {
  const isBal = wing === 'bal';
  return {
    isBal,
    wing,
    wingLabelGujarati: isBal ? 'બાળ મંડળ' : 'બાલિકા મંડળ',
    appBg: isBal ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#FFFBFB] text-[#1E1B18]',
    headerBg: isBal
      ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/80'
      : 'bg-white/85 backdrop-blur-md border-b border-rose-100',
    primaryGradient: isBal
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
      : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25',
    primaryAccentText: isBal ? 'text-blue-600' : 'text-rose-600',
    primarySoftBg: isBal ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200',
    avatarBadge: isBal ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-rose-100 text-rose-700 border border-rose-200',
    cardBorder: isBal ? 'border-slate-200/80' : 'border-rose-100',
    quoteBorder: isBal ? 'border-l-4 border-blue-500' : 'border-l-4 border-rose-500',
    progressBarFill: isBal ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-rose-500 to-pink-600',
    ringFocus: isBal ? 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600' : 'focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600',
    accentRing: isBal ? 'ring-blue-500' : 'ring-rose-500',
    accentHover: isBal ? 'hover:bg-blue-50' : 'hover:bg-rose-50',
    pillActive: isBal ? 'bg-blue-600 text-white shadow-sm' : 'bg-rose-600 text-white shadow-sm',
    pillInactive: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  };
};
