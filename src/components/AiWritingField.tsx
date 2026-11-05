import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Check,
  X,
  CheckCheck,
  Shield,
  RotateCcw,
  Wand2,
  ChevronDown,
  FileCheck2,
  AlignLeft,
  Briefcase,
  SpellCheck,
} from 'lucide-react';
import { WritingSuggestion, WritingAssistResponse, WritingAssistMode } from '../types';
import { assistWriting } from '../services/api';
import { useWritingAssist } from '../contexts/WritingAssistContext';
import { Tooltip } from './Tooltip';

interface AiWritingFieldProps {
  id: string;
  type?: 'textarea' | 'input';
  label?: string;
  labelExtra?: React.ReactNode;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  fieldName: string;
  fieldCategoryContext?: string;
  className?: string;
  inputClassName?: string;
  helperText?: string;
}

export const AiWritingField: React.FC<AiWritingFieldProps> = ({
  id,
  type = 'textarea',
  label,
  labelExtra,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 3,
  fieldName,
  fieldCategoryContext,
  className = '',
  inputClassName = '',
  helperText,
}) => {
  const { isEnabled, toggleEnabled } = useWritingAssist();
  const [status, setStatus] = useState<'idle' | 'checking' | 'has_suggestions' | 'clean'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [cleanText, setCleanText] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedTextRef = useRef<string>('');
  const clientCacheRef = useRef<Map<string, WritingAssistResponse>>(new Map());
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time automatic background typing assist
  useEffect(() => {
    if (!isEnabled) {
      setStatus('idle');
      setSuggestions([]);
      return;
    }

    const trimmed = value.trim();

    // Reset if text is too short (< 4 chars)
    if (trimmed.length < 4) {
      setStatus('idle');
      setSuggestions([]);
      setCleanText(null);
      return;
    }

    // Skip if unchanged since last check
    if (trimmed === lastCheckedTextRef.current) {
      return;
    }

    // Check client-side memory cache first
    const cacheKey = `realtime:${fieldName}:${trimmed.toLowerCase()}`;
    const cachedResponse = clientCacheRef.current.get(cacheKey);
    if (cachedResponse) {
      lastCheckedTextRef.current = trimmed;
      if (cachedResponse.hasSuggestions && cachedResponse.suggestions.length > 0) {
        const activeSuggestions = cachedResponse.suggestions.filter(
          (s) => !dismissedIds.has(s.id) && !dismissedIds.has(`${s.original}-${s.suggested}`)
        );
        if (activeSuggestions.length > 0) {
          setSuggestions(activeSuggestions);
          setCleanText(cachedResponse.cleanText || null);
          setStatus('has_suggestions');
          setShowCard(true);
        } else {
          setSuggestions([]);
          setStatus('clean');
        }
      } else {
        setSuggestions([]);
        setStatus('clean');
      }
      return;
    }

    setStatus('checking');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      lastCheckedTextRef.current = trimmed;
      try {
        const response: WritingAssistResponse = await assistWriting(
          trimmed,
          fieldName,
          fieldCategoryContext,
          'realtime'
        );

        // Store in client-side cache
        clientCacheRef.current.set(cacheKey, response);

        if (response.hasSuggestions && response.suggestions.length > 0) {
          // Filter out previously dismissed suggestions
          const activeSuggestions = response.suggestions.filter(
            (s) => !dismissedIds.has(s.id) && !dismissedIds.has(`${s.original}-${s.suggested}`)
          );

          if (activeSuggestions.length > 0) {
            setSuggestions(activeSuggestions);
            setCleanText(response.cleanText || null);
            setStatus('has_suggestions');
            setShowCard(true);
          } else {
            setSuggestions([]);
            setStatus('clean');
          }
        } else {
          setSuggestions([]);
          setStatus('clean');
        }
      } catch (err) {
        setStatus('idle');
      }
    }, 750);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, isEnabled, fieldName, fieldCategoryContext, dismissedIds]);

  // On-demand AI Enhance / Polish action
  const handleTriggerAssist = async (mode: WritingAssistMode) => {
    setMenuOpen(false);
    const trimmed = value.trim();
    if (!trimmed) {
      setStatusMessage('Please enter some text first');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setStatus('checking');
    try {
      const response: WritingAssistResponse = await assistWriting(
        trimmed,
        fieldName,
        fieldCategoryContext,
        mode
      );

      if (response.hasSuggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        setCleanText(response.cleanText || null);
        setStatus('has_suggestions');
        setShowCard(true);
        setStatusMessage(response.analysisSummary || `${response.suggestions.length} suggestions found`);
      } else if (response.cleanText && response.cleanText !== trimmed) {
        // Direct clean text available
        setSuggestions([
          {
            id: `polish-${Date.now()}`,
            type: mode === 'concise' ? 'concise' : mode === 'professional' ? 'professional' : 'clarity',
            original: trimmed,
            suggested: response.cleanText,
            reason: response.analysisSummary || `Refined for ${mode} clarity`,
            confidence: 0.95,
          },
        ]);
        setCleanText(response.cleanText);
        setStatus('has_suggestions');
        setShowCard(true);
      } else {
        setSuggestions([]);
        setStatus('clean');
        setStatusMessage('✨ Looking great! No issues found.');
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (err) {
      setStatus('idle');
      setStatusMessage('Could not analyze text right now');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleApplySingle = (suggestion: WritingSuggestion) => {
    setPreviousText(value);
    let newText = value;

    if (value.includes(suggestion.original)) {
      newText = value.replace(suggestion.original, suggestion.suggested);
    } else {
      const lowerVal = value.toLowerCase();
      const lowerOrig = suggestion.original.toLowerCase();
      const idx = lowerVal.indexOf(lowerOrig);
      if (idx !== -1) {
        newText =
          value.substring(0, idx) +
          suggestion.suggested +
          value.substring(idx + suggestion.original.length);
      } else {
        newText = suggestion.suggested;
      }
    }

    onChange(newText);
    lastCheckedTextRef.current = newText.trim();

    setDismissedIds((prev) => {
      const updated = new Set(prev);
      updated.add(suggestion.id);
      updated.add(`${suggestion.original}-${suggestion.suggested}`);
      return updated;
    });

    const remaining = suggestions.filter((s) => s.id !== suggestion.id);
    setSuggestions(remaining);
    if (remaining.length === 0) {
      setStatus('clean');
      setStatusMessage('Applied!');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleApplyAll = () => {
    setPreviousText(value);
    let newText = cleanText || value;

    if (!cleanText) {
      for (const s of suggestions) {
        if (newText.includes(s.original)) {
          newText = newText.replace(s.original, s.suggested);
        }
      }
    }

    onChange(newText);
    lastCheckedTextRef.current = newText.trim();

    setDismissedIds((prev) => {
      const updated = new Set(prev);
      suggestions.forEach((s) => {
        updated.add(s.id);
        updated.add(`${s.original}-${s.suggested}`);
      });
      return updated;
    });

    setSuggestions([]);
    setStatus('clean');
    setStatusMessage('All enhancements applied!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleUndo = () => {
    if (previousText !== null) {
      onChange(previousText);
      lastCheckedTextRef.current = previousText.trim();
      setPreviousText(null);
      setStatusMessage('Reverted to previous version');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleDismissSingle = (suggestion: WritingSuggestion) => {
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      updated.add(suggestion.id);
      updated.add(`${suggestion.original}-${suggestion.suggested}`);
      return updated;
    });

    const remaining = suggestions.filter((s) => s.id !== suggestion.id);
    setSuggestions(remaining);
    if (remaining.length === 0) {
      setStatus('clean');
    }
  };

  const handleDismissAll = () => {
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      suggestions.forEach((s) => {
        updated.add(s.id);
        updated.add(`${s.original}-${s.suggested}`);
      });
      return updated;
    });
    setSuggestions([]);
    setStatus('clean');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header with Label and AI Tools */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          {label && (
            <label
              htmlFor={id}
              className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
            >
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {labelExtra}
        </div>

        {/* AI Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick status message toast */}
          {statusMessage && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              {statusMessage}
            </span>
          )}

          {/* Undo Button if available */}
          {previousText !== null && (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
              title="Undo last applied change"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}

          {isEnabled ? (
            <div className="flex items-center gap-1.5">
              {/* Status Badge / Suggestions Count */}
              {status === 'checking' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </span>
              ) : status === 'has_suggestions' ? (
                <button
                  type="button"
                  onClick={() => setShowCard(!showCard)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 cursor-pointer transition-colors shadow-2xs"
                  title="Toggle suggestions view"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>
                    {suggestions.length} {suggestions.length === 1 ? 'Suggestion' : 'Suggestions'}
                  </span>
                </button>
              ) : null}

              {/* Polish Dropdown Menu Trigger */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  id={`${id}-polish-menu-btn`}
                  onClick={() => setMenuOpen(!menuOpen)}
                  disabled={status === 'checking'}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Enhance & polish this field with AI"
                >
                  <Wand2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>AI Polish</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {/* Dropdown Options */}
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-fadeIn text-xs">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      AI Writing Tools
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTriggerAssist('polish')}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <div className="font-bold">Auto-Polish</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Clarity & smooth flow
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAssist('grammar')}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <SpellCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="font-bold">Fix Typos & Grammar</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Spelling, syntax & punctuation
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAssist('concise')}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div className="font-bold">Make Concise</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Trim wordiness & fluff
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAssist('professional')}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-bold">Professional Tone</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Constructive & clear
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Turn Off Quick Toggle */}
              <Tooltip content="Turn AI Writing Assistant Off" position="top">
                <button
                  type="button"
                  onClick={toggleEnabled}
                  id={`${id}-assist-toggle`}
                  className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-1 hover:underline cursor-pointer"
                >
                  [ON]
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="hidden sm:inline">AI Assist: Off</span>
              <Tooltip content="Turn ON Real-Time AI Writing Assistant" position="top">
                <button
                  type="button"
                  onClick={toggleEnabled}
                  id={`${id}-assist-toggle-on`}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  Turn ON
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Input or Textarea element */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={rows}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              suggestions.length > 0 ? 'border-amber-300 dark:border-amber-600/80 ring-1 ring-amber-200 dark:ring-amber-900/40' : ''
            } ${inputClassName}`}
          />
        ) : (
          <input
            type="text"
            id={id}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              suggestions.length > 0 ? 'border-amber-300 dark:border-amber-600/80 ring-1 ring-amber-200 dark:ring-amber-900/40' : ''
            } ${inputClassName}`}
          />
        )}
      </div>

      {/* Helper text if provided */}
      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {/* ====================================================
          AI SUGGESTIONS REVIEW PANEL (Compact & Clear)
         ==================================================== */}
      {isEnabled && suggestions.length > 0 && showCard && (
        <div className="p-2.5 bg-amber-50/90 dark:bg-amber-950/30 rounded-xl border border-amber-200/90 dark:border-amber-800/60 shadow-2xs space-y-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                Suggestions ({suggestions.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {suggestions.length > 1 && (
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Apply All</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-[10px] text-amber-800/80 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* List of individual suggestions */}
          <div className="space-y-1.5">
            {suggestions.map((suggestion) => {
              return (
                <div
                  key={suggestion.id}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="line-through text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1 rounded truncate max-w-[140px]">
                        "{suggestion.original}"
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded font-semibold truncate max-w-[180px]">
                        "{suggestion.suggested}"
                      </span>
                    </div>
                    {suggestion.reason && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">
                        {suggestion.reason}
                      </p>
                    )}
                  </div>

                  {/* Actions: [Keep] [Apply] */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDismissSingle(suggestion)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySingle(suggestion)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
