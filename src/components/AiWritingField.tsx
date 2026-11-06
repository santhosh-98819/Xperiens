import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Check,
  CheckCheck,
  RotateCcw,
  Wand2,
  ChevronDown,
  AlignLeft,
  Briefcase,
  SpellCheck,
  ArrowRight,
} from 'lucide-react';
import { WritingSuggestion, WritingAssistResponse, WritingAssistMode } from '../types';
import { assistWriting } from '../services/api';
import { useWritingAssist } from '../contexts/WritingAssistContext';

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setStatus('idle');
      setSuggestions([]);
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < 4) {
      setStatus('idle');
      setSuggestions([]);
      setCleanText(null);
      return;
    }

    if (trimmed === lastCheckedTextRef.current) return;

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
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      lastCheckedTextRef.current = trimmed;
      try {
        const response: WritingAssistResponse = await assistWriting(
          trimmed,
          fieldName,
          fieldCategoryContext,
          'realtime'
        );
        clientCacheRef.current.set(cacheKey, response);
        if (response.hasSuggestions && response.suggestions.length > 0) {
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
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value, isEnabled, fieldName, fieldCategoryContext, dismissedIds]);

  const handleTriggerAssist = async (mode: WritingAssistMode) => {
    setMenuOpen(false);
    const trimmed = value.trim();
    if (!trimmed) {
      setStatusMessage('Enter text first');
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
        setStatusMessage('✨ Verified');
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (err) {
      setStatus('idle');
      setStatusMessage('Analysis unavailable');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleApplySingle = (suggestion: WritingSuggestion) => {
    setPreviousText(value);
    let newText = value;
    if (value.includes(suggestion.original)) {
      newText = value.replace(suggestion.original, suggestion.suggested);
    } else {
      const idx = value.toLowerCase().indexOf(suggestion.original.toLowerCase());
      if (idx !== -1) {
        newText = value.substring(0, idx) + suggestion.suggested + value.substring(idx + suggestion.original.length);
      } else {
        newText = suggestion.suggested;
      }
    }
    onChange(newText);
    lastCheckedTextRef.current = newText.trim();
    setDismissedIds((prev) => new Set(prev).add(suggestion.id));
    const remaining = suggestions.filter((s) => s.id !== suggestion.id);
    setSuggestions(remaining);
    if (remaining.length === 0) setStatus('clean');
  };

  const handleApplyAll = () => {
    setPreviousText(value);
    let newText = cleanText || value;
    if (!cleanText) {
      for (const s of suggestions) {
        if (newText.includes(s.original)) newText = newText.replace(s.original, s.suggested);
      }
    }
    onChange(newText);
    lastCheckedTextRef.current = newText.trim();
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      suggestions.forEach((s) => updated.add(s.id));
      return updated;
    });
    setSuggestions([]);
    setStatus('clean');
  };

  const handleUndo = () => {
    if (previousText !== null) {
      onChange(previousText);
      lastCheckedTextRef.current = previousText.trim();
      setPreviousText(null);
    }
  };

  const handleDismissSingle = (suggestion: WritingSuggestion) => {
    setDismissedIds((prev) => new Set(prev).add(suggestion.id));
    const remaining = suggestions.filter((s) => s.id !== suggestion.id);
    setSuggestions(remaining);
    if (remaining.length === 0) setStatus('clean');
  };

  const handleDismissAll = () => {
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      suggestions.forEach((s) => updated.add(s.id));
      return updated;
    });
    setSuggestions([]);
    setStatus('clean');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {label && (
            <label htmlFor={id} className="text-xs font-bold tracking-widest uppercase text-brand-text-primary dark:text-dark-text-primary">
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {labelExtra}
        </div>

        <div className="flex items-center gap-4">
          {statusMessage && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {statusMessage}
            </span>
          )}

          {previousText !== null && (
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1.5 text-[10px] font-bold text-brand-text-secondary hover:text-brand-text-primary transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          )}

          {isEnabled ? (
            <div className="flex items-center gap-4">
              {status === 'checking' ? (
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-accent">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Analyzing...
                </div>
              ) : status === 'has_suggestions' ? (
                <button
                  type="button"
                  onClick={() => setShowCard(!showCard)}
                  className="flex items-center gap-2 text-[10px] font-bold text-amber-600 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {suggestions.length} Suggestions
                </button>
              ) : null}

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  disabled={status === 'checking'}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-text-primary dark:bg-dark-text-primary text-brand-bg dark:text-dark-bg text-[10px] font-bold tracking-widest uppercase rounded-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Optimize
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-brand-card dark:bg-dark-card rounded-xl shadow-2xl border border-brand-border dark:border-dark-border py-2 z-50 animate-fadeIn overflow-hidden">
                    <div className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-brand-text-secondary border-b border-brand-border dark:border-dark-border mb-1">
                      Optimization Modes
                    </div>
                    {[
                      { id: 'polish', icon: Sparkles, title: 'Editorial Polish', desc: 'Flow and narrative clarity' },
                      { id: 'grammar', icon: SpellCheck, title: 'Precision Check', desc: 'Syntax and grammar accuracy' },
                      { id: 'concise', icon: AlignLeft, title: 'Brevity', desc: 'Synthesize core points' },
                      { id: 'professional', icon: Briefcase, title: 'Expert Tone', desc: 'Formalized language' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleTriggerAssist(mode.id as WritingAssistMode)}
                        className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-brand-bg dark:hover:bg-dark-sec-bg transition-colors cursor-pointer group"
                      >
                        <mode.icon className="w-4 h-4 text-brand-accent dark:text-dark-accent group-hover:scale-110 transition-transform" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-brand-text-primary dark:text-dark-text-primary">{mode.title}</div>
                          <div className="text-[10px] text-brand-text-secondary truncate">{mode.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleEnabled}
                className="text-[10px] font-bold text-brand-text-secondary hover:underline"
              >
                Disable AI
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleEnabled}
              className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Enable Assistant
            </button>
          )}
        </div>
      </div>

      <div className="relative group">
        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={rows}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full text-sm p-5 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-brand-text-primary dark:text-dark-text-primary focus:border-brand-accent dark:focus:border-dark-accent focus:ring-0 outline-none transition-all placeholder:text-brand-text-secondary/40 font-sans leading-relaxed shadow-sm ${
              suggestions.length > 0 ? 'ring-1 ring-amber-500/30' : ''
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
            className={`w-full text-sm p-5 rounded-xl border border-brand-border dark:border-dark-border bg-brand-card dark:bg-dark-card text-brand-text-primary dark:text-dark-text-primary focus:border-brand-accent dark:focus:border-dark-accent focus:ring-0 outline-none transition-all placeholder:text-brand-text-secondary/40 font-sans shadow-sm ${
              suggestions.length > 0 ? 'ring-1 ring-amber-500/30' : ''
            } ${inputClassName}`}
          />
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-brand-text-secondary italic font-light pl-1">{helperText}</p>
      )}

      {isEnabled && suggestions.length > 0 && showCard && (
        <div className="bg-brand-card dark:bg-dark-card rounded-xl border border-amber-200 dark:border-amber-900 shadow-xl overflow-hidden animate-fadeIn">
          <div className="px-5 py-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-900 dark:text-amber-200">
                Synthesis Recommendations
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {suggestions.length > 1 && (
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <CheckCheck className="w-4 h-4" />
                  Apply All
                </button>
              )}
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-[10px] font-bold text-brand-text-secondary hover:text-brand-text-primary"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="divide-y divide-brand-border dark:divide-dark-border">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="line-through text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded opacity-60">"{suggestion.original}"</span>
                    <ArrowRight className="w-4 h-4 text-brand-text-secondary" />
                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded font-bold">"{suggestion.suggested}"</span>
                  </div>
                  {suggestion.reason && (
                    <p className="text-[11px] text-brand-text-secondary italic font-light">
                      {suggestion.reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                   <button
                     type="button"
                     onClick={() => handleDismissSingle(suggestion)}
                     className="px-4 py-2 text-[11px] font-bold text-brand-text-secondary hover:text-brand-text-primary cursor-pointer"
                   >
                     Ignore
                   </button>
                   <button
                     type="button"
                     onClick={() => handleApplySingle(suggestion)}
                     className="px-5 py-2 bg-brand-accent dark:bg-dark-accent text-white dark:text-dark-bg text-[11px] font-bold rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
                   >
                     Apply
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
