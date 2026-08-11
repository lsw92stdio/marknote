import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, Replace } from 'lucide-react';

export interface EditorRef {
  insertText: (prefix: string, suffix?: string, defaultText?: string) => void;
  focus: () => void;
  scrollToRatio: (ratio: number) => void;
  undo: () => void;
  redo: () => void;
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  onCursorChange?: (line: number, col: number) => void;
  onScroll?: (ratio: number) => void;
  /** History resets whenever this changes (pass the active file's id) */
  historyKey?: string;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

const HISTORY_DEBOUNCE_MS = 500;
const HISTORY_LIMIT = 100;

export const Editor = forwardRef<EditorRef, EditorProps>(
  ({ value, onChange, isDark, onCursorChange, onScroll, historyKey, onHistoryChange }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const findInputRef = useRef<HTMLInputElement>(null);
    const [linesCount, setLinesCount] = useState(1);

    // Find & Replace
    const [isFindOpen, setIsFindOpen] = useState(false);
    const [showReplace, setShowReplace] = useState(false);
    const [findQuery, setFindQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [matches, setMatches] = useState<number[]>([]);
    const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

    // Undo/Redo history — independent of the browser's native textarea undo stack,
    // which gets desynced by programmatic edits (toolbar inserts, Tab indent, etc.)
    const historyRef = useRef<string[]>([value]);
    const historyIndexRef = useRef(0);
    const skipNextHistoryPushRef = useRef(false);

    const notifyHistoryChange = () => {
      onHistoryChange?.(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1
      );
    };

    // Reset history when switching to a different document
    useEffect(() => {
      historyRef.current = [value];
      historyIndexRef.current = 0;
      notifyHistoryChange();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyKey]);

    // Debounced checkpoint: coalesces rapid typing into one undo step per pause
    useEffect(() => {
      if (skipNextHistoryPushRef.current) {
        skipNextHistoryPushRef.current = false;
        return;
      }
      const timer = setTimeout(() => {
        if (historyRef.current[historyIndexRef.current] === value) return;
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(value);
        if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
        historyIndexRef.current = historyRef.current.length - 1;
        notifyHistoryChange();
      }, HISTORY_DEBOUNCE_MS);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleUndo = () => {
      if (historyIndexRef.current <= 0) return;
      historyIndexRef.current -= 1;
      skipNextHistoryPushRef.current = true;
      onChange(historyRef.current[historyIndexRef.current]);
      notifyHistoryChange();
    };

    const handleRedo = () => {
      if (historyIndexRef.current >= historyRef.current.length - 1) return;
      historyIndexRef.current += 1;
      skipNextHistoryPushRef.current = true;
      onChange(historyRef.current[historyIndexRef.current]);
      notifyHistoryChange();
    };

    useEffect(() => {
      const lines = value.split('\n').length;
      setLinesCount(lines || 1);
    }, [value]);

    // Recompute matches whenever the query or content changes.
    // currentMatchIdx of -1 means "no match selected/highlighted yet" so the first
    // Enter press lands on match #1 instead of skipping ahead to #2.
    const lastFindQueryRef = useRef(findQuery);
    useEffect(() => {
      const isNewQuery = lastFindQueryRef.current !== findQuery;
      lastFindQueryRef.current = findQuery;

      if (!findQuery) {
        setMatches([]);
        setCurrentMatchIdx(-1);
        return;
      }
      const found: number[] = [];
      const lowerValue = value.toLowerCase();
      const lowerQuery = findQuery.toLowerCase();
      let idx = lowerValue.indexOf(lowerQuery);
      while (idx !== -1) {
        found.push(idx);
        idx = lowerValue.indexOf(lowerQuery, idx + 1);
      }
      setMatches(found);
      setCurrentMatchIdx((prev) => {
        if (found.length === 0 || isNewQuery) return -1;
        return Math.min(Math.max(prev, -1), found.length - 1);
      });
    }, [findQuery, value]);

    const scrollMatchIntoView = (matchStart: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const lineIndex = value.substring(0, matchStart).split('\n').length - 1;
      const lineHeight = 24; // matches the textarea's leading-6
      const target = lineIndex * lineHeight - textarea.clientHeight / 2;
      textarea.scrollTop = Math.max(0, target);
    };

    const selectMatch = (index: number) => {
      const textarea = textareaRef.current;
      if (!textarea || matches.length === 0) return;
      const clamped = ((index % matches.length) + matches.length) % matches.length;
      const start = matches[clamped];
      setCurrentMatchIdx(clamped);
      textarea.focus();
      textarea.setSelectionRange(start, start + findQuery.length);
      scrollMatchIntoView(start);
    };

    const openFind = (withReplace: boolean) => {
      const textarea = textareaRef.current;
      const selected = textarea ? value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
      setShowReplace(withReplace);
      setIsFindOpen(true);
      if (selected) setFindQuery(selected);
      setTimeout(() => {
        findInputRef.current?.focus();
        findInputRef.current?.select();
      }, 0);
    };

    const closeFind = () => {
      setIsFindOpen(false);
      textareaRef.current?.focus();
    };

    const handleReplaceCurrent = () => {
      if (matches.length === 0) return;
      const start = matches[currentMatchIdx] ?? matches[0];
      const end = start + findQuery.length;
      const newValue = value.substring(0, start) + replaceQuery + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        const newPos = start + replaceQuery.length;
        textareaRef.current?.setSelectionRange(newPos, newPos);
      }, 0);
    };

    const handleReplaceAll = () => {
      if (!findQuery || matches.length === 0) return;
      const pattern = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const newValue = value.replace(new RegExp(pattern, 'gi'), replaceQuery);
      onChange(newValue);
    };

    useImperativeHandle(ref, () => ({
      insertText: (prefix: string, suffix = '', defaultText = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end) || defaultText;

        const replacement = prefix + selectedText + suffix;
        const newValue = value.substring(0, start) + replacement + value.substring(end);

        onChange(newValue);

        setTimeout(() => {
          textarea.focus();
          const newStart = start + prefix.length;
          const newEnd = newStart + selectedText.length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      },
      focus: () => {
        textareaRef.current?.focus();
      },
      scrollToRatio: (ratio: number) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.scrollTop = ratio * (textarea.scrollHeight - textarea.clientHeight);
      },
      undo: handleUndo,
      redo: handleRedo,
    }));

    const handleScroll = () => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      if (onScroll && textareaRef.current) {
        const el = textareaRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        onScroll(maxScroll > 0 ? el.scrollTop / maxScroll : 0);
      }
    };

    const handleSelectionChange = () => {
      if (!textareaRef.current || !onCursorChange) return;

      const textarea = textareaRef.current;
      const pos = textarea.selectionStart;
      const textUpToCursor = value.substring(0, pos);
      const lines = textUpToCursor.split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;

      onCursorChange(line, col);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Shift+Tab — outdent: remove up to 2 leading spaces (or a tab) from the current line
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEndIdx = value.indexOf('\n', lineStart);
        const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
        const lineText = value.substring(lineStart, lineEnd);

        const removeCount = lineText.startsWith('  ') ? 2 : lineText.startsWith(' ') || lineText.startsWith('\t') ? 1 : 0;
        if (removeCount === 0) return;

        const newValue = value.substring(0, lineStart) + lineText.substring(removeCount) + value.substring(lineEnd);
        onChange(newValue);

        setTimeout(() => {
          textarea.setSelectionRange(
            Math.max(lineStart, start - removeCount),
            Math.max(lineStart, end - removeCount)
          );
        }, 0);
        return;
      }

      // Tab indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert 2 spaces
        const indent = '  ';
        const newValue = value.substring(0, start) + indent + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + indent.length;
        }, 0);
        return;
      }

      // Shift+Enter — markdown hard line break (two trailing spaces) within the same
      // paragraph, since a plain Enter/newline is collapsed by CommonMark renderers
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const insertion = '  \n';
        const newValue = value.substring(0, start) + insertion + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
        }, 0);
        return;
      }

      // Keyboard Shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        if (key === 'b') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selected = value.substring(start, end) || '강조';
          const replacement = `**${selected}**`;
          onChange(value.substring(0, start) + replacement + value.substring(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + 2, start + 2 + selected.length);
          }, 0);
        } else if (key === 'i') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selected = value.substring(start, end) || '기울임';
          const replacement = `*${selected}*`;
          onChange(value.substring(0, start) + replacement + value.substring(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + 1, start + 1 + selected.length);
          }, 0);
        } else if (key === 'k') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selected = value.substring(start, end) || '링크 텍스트';
          const prefix = '[';
          const suffix = '](https://example.com)';
          const replacement = prefix + selected + suffix;
          onChange(value.substring(0, start) + replacement + value.substring(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
          }, 0);
        } else if (key === 's') {
          // Documents already autosave — just stop the browser's native "저장" dialog
          e.preventDefault();
        } else if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (key === '1' || key === '2' || key === '3') {
          e.preventDefault();
          const level = parseInt(key, 10);
          const start = textarea.selectionStart;
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const lineEndIdx = value.indexOf('\n', lineStart);
          const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
          const lineText = value.substring(lineStart, lineEnd);
          const stripped = lineText.replace(/^#{1,6}\s+/, '');
          const newLineText = '#'.repeat(level) + ' ' + stripped;
          const newValue = value.substring(0, lineStart) + newLineText + value.substring(lineEnd);
          onChange(newValue);
          setTimeout(() => {
            const delta = newLineText.length - lineText.length;
            const newPos = Math.max(lineStart, start + delta);
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        } else if (key === 'd') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const lineEndIdx = value.indexOf('\n', lineStart);
          const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
          const lineText = value.substring(lineStart, lineEnd);
          const newValue = value.substring(0, lineEnd) + '\n' + lineText + value.substring(lineEnd);
          onChange(newValue);
          const colOffset = start - lineStart;
          setTimeout(() => {
            const newPos = lineEnd + 1 + colOffset;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        } else if (key === 'f') {
          e.preventDefault();
          openFind(false);
        } else if (key === 'h') {
          e.preventDefault();
          openFind(true);
        }
      }
    };

    return (
      <div
        className={`relative flex w-full h-full font-mono text-sm overflow-hidden ${
          isDark ? 'bg-black text-neutral-100' : 'bg-slate-50 text-slate-800'
        }`}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className={`py-4 px-3 select-none text-right font-mono text-xs overflow-hidden border-r ${
            isDark
              ? 'bg-neutral-950 text-neutral-500 border-neutral-800'
              : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}
          style={{ width: '3.5rem' }}
        >
          {Array.from({ length: linesCount }, (_, i) => (
            <div key={i + 1} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onClick={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onKeyDown={handleKeyDown}
          placeholder="여기에 마크다운을 입력하세요..."
          spellCheck={false}
          className={`w-full h-full p-4 resize-none outline-none leading-6 font-mono tab-4 transition-colors ${
            isDark
              ? 'bg-black text-neutral-100 placeholder-neutral-600'
              : 'bg-slate-50 text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* Find & Replace Bar */}
        {isFindOpen && (
          <div
            className={`absolute top-2 right-2 z-20 flex flex-col gap-1.5 p-2 rounded-xl border shadow-lg text-xs ${
              isDark
                ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
            style={{ width: '19rem' }}
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <input
                ref={findInputRef}
                type="text"
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) selectMatch(currentMatchIdx - 1);
                    else selectMatch(currentMatchIdx + 1);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeFind();
                  }
                }}
                placeholder="찾을 내용"
                className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-700 text-neutral-100'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <span className="shrink-0 text-[11px] text-slate-400 font-mono tabular-nums">
                {matches.length > 0 ? `${currentMatchIdx + 1}/${matches.length}` : '0/0'}
              </span>
              <button
                onClick={() => selectMatch(currentMatchIdx - 1)}
                disabled={matches.length === 0}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 disabled:opacity-30 shrink-0"
                title="이전 찾기 (Shift+Enter)"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => selectMatch(currentMatchIdx + 1)}
                disabled={matches.length === 0}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 disabled:opacity-30 shrink-0"
                title="다음 찾기 (Enter)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowReplace((v) => !v)}
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 shrink-0 ${showReplace ? 'text-blue-500' : ''}`}
                title="바꾸기 (Ctrl+H)"
              >
                <Replace className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={closeFind}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 shrink-0"
                title="닫기 (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {showReplace && (
              <div className="flex items-center gap-1.5">
                <Replace className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      closeFind();
                    }
                  }}
                  placeholder="바꿀 내용"
                  className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  onClick={handleReplaceCurrent}
                  disabled={matches.length === 0}
                  className="shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                >
                  바꾸기
                </button>
                <button
                  onClick={handleReplaceAll}
                  disabled={matches.length === 0}
                  className="shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                >
                  모두 바꾸기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';
