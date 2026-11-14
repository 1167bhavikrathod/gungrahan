'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Edit3, Save, Check } from 'lucide-react';
import { SENTENCE_STARTERS, VIRTUE_QUALITY_CHIPS } from '@/config/seedKaryakars';

export default function EditGunaModal({
  isOpen,
  guna,
  onClose,
  onSave,
  theme,
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const baseContentRef = useRef('');

  useEffect(() => {
    if (guna && isOpen) {
      setContent(guna.content || '');
      baseContentRef.current = guna.content || '';
    } else {
      setContent('');
      stopVoiceRecording();
    }
  }, [guna, isOpen]);

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

  // Stop recording helper
  const stopVoiceRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
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

    baseContentRef.current = content;
    isRecordingRef.current = true;
    setIsRecording(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'gu-IN';

      recognition.onresult = (event) => {
        let finalSpeech = '';
        let interimSpeech = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSpeech += event.results[i][0].transcript + ' ';
          } else {
            interimSpeech += event.results[i][0].transcript;
          }
        }

        const combined = (finalSpeech + interimSpeech).trim();
        if (combined) {
          const base = baseContentRef.current;
          const separator = base && !base.endsWith(' ') ? ' ' : '';
          setContent(base + separator + combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          alert(
            'માઇક્રોફોનની પરવાનગી બંધ છે. કૃપા કરીને બ્રાઉઝર એડ્રેસ બારમાં માઇક આઇકોન પર ક્લિક કરીને મંજૂરી (Allow) આપો.'
          );
          stopVoiceRecording();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            stopVoiceRecording();
          }
        } else {
          setIsRecording(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech:', err);
      stopVoiceRecording();
    }
  };

  // Toggle voice recording
  const handleToggleVoice = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  // Append sentence starter
  const handleAddStarter = (starter) => {
    setContent((prev) => {
      const clean = prev.trim();
      const next = clean ? `${clean} ${starter}` : starter;
      baseContentRef.current = next;
      return next;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Append topic tag
  const handleAddTag = (tag) => {
    setContent((prev) => {
      const clean = prev.trim();
      const next = clean ? `${clean} #${tag}` : `#${tag} `;
      baseContentRef.current = next;
      return next;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 3 || isSubmitting) return;

    stopVoiceRecording();
    setIsSubmitting(true);
    try {
      await onSave({
        ...guna,
        content: content.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Error updating guna:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !guna) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${theme.headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                theme.isBal ? 'bg-gradient-to-br from-blue-700 to-indigo-800' : 'bg-gradient-to-br from-rose-600 to-pink-700'
              }`}
            >
              <Edit3 className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-stone-900 font-gujarati flex items-center gap-1.5">
                ગુણ સુધારો
              </h2>
              <p className="text-xs text-amber-900/80 font-gujarati font-medium">
                {guna.recipient_name} નો ગુણ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopVoiceRecording();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Sentence Starters */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-stone-600 font-gujarati">
              વાક્યની શરૂઆત માટે પ્રેરક વાક્યો:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SENTENCE_STARTERS.slice(0, 3).map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddStarter(starter)}
                  className="px-2.5 py-1 rounded-xl text-xs bg-amber-50/80 text-amber-950 hover:bg-amber-100/90 border border-amber-200/80 font-gujarati transition shadow-2xs"
                >
                  &ldquo;{starter}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Topic Tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {VIRTUE_QUALITY_CHIPS.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200 font-gujarati transition"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Textarea Header with Mic */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-guna-content" className="text-xs font-bold text-stone-700 font-gujarati">
                ગુણ લખાણ *
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
              id="edit-guna-content"
              ref={textareaRef}
              rows={5}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                baseContentRef.current = e.target.value;
              }}
              className="w-full p-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-sm font-gujarati text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                stopVoiceRecording();
                onClose();
              }}
              className="flex-1 h-12 rounded-2xl text-stone-700 bg-stone-100 hover:bg-stone-200 font-bold text-sm transition font-gujarati"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              disabled={isSubmitting || content.trim().length < 3}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition active:scale-[0.98] disabled:opacity-50 shadow-md ${theme.primaryGradient}`}
            >
              <Save className="w-4 h-4 text-amber-200" />
              <span className="font-gujarati text-white">
                {isSubmitting ? 'સાચવી રહ્યું છે...' : 'સુધારો સાચવો'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
