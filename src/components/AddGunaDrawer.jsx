'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  UserCheck,
  Send,
  Plus,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  VIRTUE_QUALITY_CHIPS,
  SENTENCE_STARTERS,
} from '@/config/seedKaryakars';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function AddGunaDrawer({
  isOpen,
  onClose,
  currentUser,
  karyakars = [],
  smartNudgeKaryakars = [],
  myCoverageStats,
  preselectedRecipientId = null,
  onlyUnwrittenInitial = false,
  wing = 'bal',
  theme,
  onGunaSubmitted,
}) {
  const [recipientId, setRecipientId] = useState(preselectedRecipientId || '');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [onlyUnwritten, setOnlyUnwritten] = useState(onlyUnwrittenInitial);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Synchronize preselected recipient or initial filters when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (preselectedRecipientId) {
        setRecipientId(preselectedRecipientId);
      }
      setOnlyUnwritten(onlyUnwrittenInitial);
    } else {
      setContent('');
      setRecipientSearch('');
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  }, [isOpen, preselectedRecipientId, onlyUnwrittenInitial]);

  // Setup Web Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'gu-IN';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setContent((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript;
          });
          setIsRecording(false);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Toggle Voice Recording
  const handleToggleVoice = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('તમારા બ્રાઉઝરમાં માઇક સપોર્ટ ઉપલબ્ધ નથી.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsRecording(false);
      }
    }
  };

  // Eligible recipients (exclude current user)
  const eligibleKaryakars = useMemo(() => {
    return karyakars.filter((k) => k.id !== currentUser?.id);
  }, [karyakars, currentUser]);

  // Filtered recipients based on unwritten toggle & search
  const filteredRecipients = useMemo(() => {
    let list = eligibleKaryakars;

    if (onlyUnwritten && myCoverageStats?.unwrittenKaryakars) {
      const unwrittenSet = new Set(myCoverageStats.unwrittenKaryakars.map((k) => k.id));
      list = list.filter((k) => unwrittenSet.has(k.id));
    }

    if (recipientSearch.trim()) {
      const q = recipientSearch.trim().toLowerCase();
      list = list.filter((k) => k.name.toLowerCase().includes(q));
    }

    return list;
  }, [eligibleKaryakars, onlyUnwritten, myCoverageStats, recipientSearch]);

  // Check if search query has exact match
  const hasExactRecipientMatch = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    return eligibleKaryakars.some((k) => k.name.toLowerCase() === q);
  }, [eligibleKaryakars, recipientSearch]);

  // Append sentence starter to textarea
  const handleAddSentenceStarter = (starter) => {
    setContent((prev) => {
      const cleanPrev = prev.trim();
      const newText = cleanPrev ? `${cleanPrev} ${starter}` : starter;
      return newText;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Append topic tag
  const handleAddTopicTag = (tag) => {
    setContent((prev) => {
      const cleanPrev = prev.trim();
      return cleanPrev ? `${cleanPrev} #${tag}` : `#${tag} `;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle unregistered recipient creation
  const handleCreateNewRecipient = async () => {
    const cleanName = recipientSearch.trim();
    if (cleanName.length < 2) return;

    try {
      let newRecip = null;
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('karyakars')
          .insert({
            name: cleanName,
            wing,
            is_pre_registered: false,
          })
          .select()
          .single();

        if (error) {
          newRecip = {
            id: `temp-recip-${Date.now()}`,
            name: cleanName,
            wing,
            is_pre_registered: false,
          };
        } else {
          newRecip = data;
        }
      } else {
        newRecip = {
          id: `local-recip-${Date.now()}`,
          name: cleanName,
          wing,
          is_pre_registered: false,
        };
      }

      setRecipientId(newRecip.id);
      setRecipientSearch('');
    } catch (err) {
      console.error('Failed to create new recipient:', err);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientId || content.trim().length < 3 || isSubmitting) return;

    const selectedRecipient = eligibleKaryakars.find((k) => k.id === recipientId);
    if (!selectedRecipient) {
      alert('કૃપા કરીને કાર્યકર પસંદ કરો.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newGunaData = {
        author_id: currentUser.id,
        author_name: currentUser.name,
        recipient_id: selectedRecipient.id,
        recipient_name: selectedRecipient.name,
        content: content.trim(),
        wing,
        rajipo_count: 0,
      };

      let insertedGuna = null;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('gunas')
          .insert(newGunaData)
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert guna failed, using local fallback:', error.message);
          insertedGuna = {
            id: `local-guna-${Date.now()}`,
            ...newGunaData,
            created_at: new Date().toISOString(),
          };
        } else {
          insertedGuna = data;
        }
      } else {
        insertedGuna = {
          id: `local-guna-${Date.now()}`,
          ...newGunaData,
          created_at: new Date().toISOString(),
        };
      }

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      // Reset and notify parent
      if (onGunaSubmitted) {
        onGunaSubmitted(insertedGuna);
      }

      setContent('');
      setRecipientId('');
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Drawer Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${theme.headerBg}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${theme.isBal ? 'bg-blue-600' : 'bg-rose-500'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 font-gujarati">
                નવો ગુણ લખો (+ Add ગુણ)
              </h2>
              <p className="text-[11px] text-slate-500 font-gujarati">
                બીજા કાર્યકરની ઉત્તમ સેવા કે ગુણની કદર કરો
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. "કોનો ગુણ બાકી?" Smart Unrecognized Karyakar Nudge (Enhancement #1) */}
          {smartNudgeKaryakars.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 font-gujarati">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>💡 સૂચન — આ કાર્યકરોનો ગુણ લખવાનો બાકી છે:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {smartNudgeKaryakars.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => {
                      setRecipientId(k.id);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition font-gujarati ${
                      recipientId === k.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    • {k.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Searchable Karyakar Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="recipient-select" className="text-xs font-bold text-slate-700 font-gujarati">
                કોનો ગુણ લખવો છે? *
              </label>

              {/* Unwritten Filter Toggle */}
              {myCoverageStats?.unwrittenKaryakars?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyUnwritten(!onlyUnwritten)}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-gujarati font-semibold transition ${
                    onlyUnwritten
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  માત્ર બાકી રહેલા ({myCoverageStats.unwrittenKaryakars.length})
                </button>
              )}
            </div>

            {/* Recipient Dropdown */}
            <select
              id="recipient-select"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-gujarati text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            >
              <option value="">-- કાર્યકર પસંદ કરો --</option>
              {filteredRecipients.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>

            {/* Search or Add Unregistered Inline Helper */}
            <div className="pt-1">
              <input
                type="text"
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                placeholder="લિસ્ટમાં નામ ન મળ્યું? શોધો અથવા નવું ઉમેરો..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-gujarati placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {recipientSearch.trim().length >= 2 && !hasExactRecipientMatch && (
                <button
                  type="button"
                  onClick={handleCreateNewRecipient}
                  className="mt-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition flex items-center justify-center gap-1 font-gujarati"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ &quot;{recipientSearch.trim()}&quot; નવું નામ લિસ્ટમાં ઉમેરો અને સિલેક્ટ કરો</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. 1-Tap Gujarati Sentence Starters (Enhancement #2) */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 font-gujarati">
              ⚡ ૧-ટેપ પ્રારંભિક વાક્યો (Anti-Writer&apos;s Block):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SENTENCE_STARTERS.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSentenceStarter(starter)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 font-gujarati transition"
                >
                  &ldquo;{starter}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Topic Tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {VIRTUE_QUALITY_CHIPS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTopicTag(tag)}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 font-gujarati transition"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* 4. Textarea with Voice-to-Text Mic (Enhancement #6) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="guna-content" className="text-xs font-bold text-slate-700 font-gujarati">
                ગુણ વર્ણન (ઓછામાં ઓછા ૩ અક્ષર) *
              </label>

              {/* Gujarati Mic Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition font-gujarati ${
                    isRecording
                      ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>🔴 સાંભળી રહ્યું છે... બોલો</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      <span>🎤 બોલીને લખો (Gujarati Mic)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <textarea
              id="guna-content"
              ref={textareaRef}
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="તેમણે સેવામાં શું ઉત્તમ કર્યું? શાંતિથી, પ્રેમથી કે ખંતપૂર્વક કરેલી સેવા લખો..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-gujarati text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              required
            />
          </div>

          {/* 5. Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !recipientId || content.trim().length < 3}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${theme.primaryGradient}`}
            >
              <Send className="w-4 h-4" />
              <span className="font-gujarati">
                {isSubmitting ? 'ઉમેરાઈ રહ્યું છે...' : '✓ ગુણ ઉમેરો (Submit ગુણ)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
