'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Mic,
  MicOff,
  PenTool,
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
import { appendSpeechTranscript } from '@/lib/utils';

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
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const lastFinalIndexRef = useRef(-1);
  const restartTimerRef = useRef(null);

  // Stop recording helper
  const stopVoiceRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch (e) {
        try {
          rec.abort();
        } catch (e2) {}
      }
    }

    // Cleanly finalize content without trailing whitespace
    setContent((prev) => (finalTranscriptRef.current || prev || '').trim());
  };

  // Helper to initialize and start a SpeechRecognition instance cleanly
  const initRecognition = () => {
    if (!isRecordingRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'gu-IN';

      lastFinalIndexRef.current = -1;

      recognition.onresult = (event) => {
        if (!isRecordingRef.current) return;
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (!result || !result[0]) continue;

          if (result.isFinal) {
            // Guard: in a single session, never process the same index twice
            if (i > lastFinalIndexRef.current) {
              lastFinalIndexRef.current = i;
              const chunk = result[0].transcript.trim();
              if (chunk) {
                finalTranscriptRef.current = appendSpeechTranscript(
                  finalTranscriptRef.current,
                  chunk
                );
              }
            }
          } else {
            interimText += result[0].transcript;
          }
        }

        // Live display: combine finalized accumulator with interim speech
        const combined = appendSpeechTranscript(
          finalTranscriptRef.current,
          interimText
        );
        setContent(combined);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('માઇક્રોફોનની પરવાનગી બંધ છે. કૃપા કરીને બ્રાઉઝર એડ્રેસ બારમાં માઇક આઇકોન પર ક્લિક કરીને મંજૂરી (Allow) આપો.');
          stopVoiceRecording();
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }

        // If user hasn't pressed stop button, auto-restart cleanly
        // with finalTranscriptRef holding all previously finalized sentences so NO PREVIOUS SENTENCES ARE EVER OVERWRITTEN!
        if (isRecordingRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isRecordingRef.current) {
              initRecognition();
            }
          }, 100);
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      if (isRecordingRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            initRecognition();
          }
        }, 300);
      }
    }
  };

  // Start continuous voice recording
  const startVoiceRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('તમારા બ્રાઉઝરમાં માઇક્રોફોન સ્પીચ સપોર્ટ નથી. કૃપા કરીને Google Chrome અથવા Edge વાપરો.');
      return;
    }

    if (isRecordingRef.current) {
      stopVoiceRecording();
      return;
    }

    // Capture initial textarea content so previous sentences/typing are never lost
    const initialText = content.trim();
    finalTranscriptRef.current = initialText;

    isRecordingRef.current = true;
    setIsRecording(true);

    initRecognition();
  };

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
      stopVoiceRecording();
      finalTranscriptRef.current = '';
    }
  }, [isOpen, preselectedRecipientId, onlyUnwrittenInitial]);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
    return () => {
      stopVoiceRecording();
    };
  }, []);

  // Toggle Voice Recording
  const handleToggleVoice = () => {
    if (isRecordingRef.current) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
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
      const cleanPrev = (finalTranscriptRef.current || prev || '').trim();
      const newText = cleanPrev ? `${cleanPrev} ${starter}` : starter;
      finalTranscriptRef.current = newText;
      return newText;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Append topic tag
  const handleAddTopicTag = (tag) => {
    setContent((prev) => {
      const cleanPrev = (finalTranscriptRef.current || prev || '').trim();
      const newText = cleanPrev ? `${cleanPrev} #${tag}` : `#${tag} `;
      finalTranscriptRef.current = newText.trim();
      return newText;
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
    stopVoiceRecording();
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Drawer Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${theme.headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs ${theme.isBal ? 'bg-gradient-to-br from-blue-700 to-indigo-800' : 'bg-gradient-to-br from-rose-600 to-pink-700'}`}>
              <PenTool className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-stone-900 font-gujarati">
                નવો ગુણ ઉમેરો
              </h2>
              <p className="text-[11px] text-amber-900/80 font-gujarati">
                બીજા કાર્યકરની ઉત્તમ સેવા કે ગુણની કદર કરો
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. "કોનો ગુણ બાકી?" Smart Unrecognized Karyakar Nudge (Enhancement #1) */}
          {smartNudgeKaryakars.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/70 via-yellow-50 to-orange-100/50 border border-amber-300/80 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 font-gujarati">
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
                    className={`px-3 py-1 rounded-full text-xs font-bold transition font-gujarati shadow-2xs ${
                      recipientId === k.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-amber-950 border border-amber-300 hover:bg-amber-100'
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
              <label htmlFor="recipient-select" className="text-xs font-bold text-stone-700 font-gujarati">
                કોનો ગુણ લખવો છે? *
              </label>

              {/* Unwritten Filter Toggle */}
              {myCoverageStats?.unwrittenKaryakars?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyUnwritten(!onlyUnwritten)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-gujarati font-bold transition shadow-2xs ${
                    onlyUnwritten
                      ? 'bg-blue-700 text-white'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
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
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-gujarati text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
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
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-gujarati placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
              />
              {recipientSearch.trim().length >= 2 && !hasExactRecipientMatch && (
                <button
                  type="button"
                  onClick={handleCreateNewRecipient}
                  className="mt-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition flex items-center justify-center gap-1 font-gujarati shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>&quot;{recipientSearch.trim()}&quot; નવું નામ લિસ્ટમાં ઉમેરો અને સિલેક્ટ કરો</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. 1-Tap Gujarati Sentence Starters */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-stone-600 font-gujarati">
              વાક્યની શરૂઆત માટે પ્રેરક વાક્યો:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SENTENCE_STARTERS.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSentenceStarter(starter)}
                  className="px-3 py-1.5 min-h-[36px] rounded-xl text-xs bg-amber-50/80 text-amber-950 hover:bg-amber-100/90 active:scale-95 border border-amber-200/80 font-gujarati transition shadow-2xs"
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
                className="px-3 py-1.5 min-h-[32px] rounded-xl text-[11px] font-semibold bg-stone-50 text-stone-700 hover:bg-amber-50 active:scale-95 border border-stone-200 font-gujarati transition"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* 4. Textarea with Voice-to-Text Mic */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="guna-content" className="text-xs font-bold text-stone-700 font-gujarati">
                ગુણની વિગત *
              </label>

              {/* Gujarati Mic Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition font-gujarati shadow-2xs ${
                    isRecording
                      ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                      : 'bg-amber-100/80 text-amber-950 hover:bg-amber-200/80 border border-amber-300'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>🔴 સાંભળી રહ્યું છે...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-amber-700" />
                      <span>🎤 બોલીને લખો</span>
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
              onChange={(e) => {
                setContent(e.target.value);
                finalTranscriptRef.current = e.target.value;
              }}
              placeholder="તેમણે સેવામાં શું ઉત્તમ કર્યું? શાંતિથી, પ્રેમથી કે ખંતપૂર્વક કરેલી સેવા લખો..."
              className="w-full p-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-sm font-gujarati text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400 shadow-2xs"
              required
            />
          </div>

          {/* 5. Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !recipientId || content.trim().length < 3}
              className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-base transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${theme.primaryGradient}`}
            >
              <Send className="w-5 h-5 text-amber-200" />
              <span className="font-gujarati text-white">
                {isSubmitting ? 'ઉમેરાઈ રહ્યું છે...' : 'ગુણ સમર્પિત કરો'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
