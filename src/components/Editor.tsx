import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface EditorRef {
  insertText: (prefix: string, suffix?: string, defaultText?: string) => void;
  focus: () => void;
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  onCursorChange?: (line: number, col: number) => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  ({ value, onChange, isDark, onCursorChange }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const [linesCount, setLinesCount] = useState(1);

    useEffect(() => {
      const lines = value.split('\n').length;
      setLinesCount(lines || 1);
    }, [value]);

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
    }));

    const handleScroll = () => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
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

      // Keyboard Shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selected = value.substring(start, end) || '강조';
          const replacement = `**${selected}**`;
          onChange(value.substring(0, start) + replacement + value.substring(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + 2, start + 2 + selected.length);
          }, 0);
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selected = value.substring(start, end) || '기울임';
          const replacement = `*${selected}*`;
          onChange(value.substring(0, start) + replacement + value.substring(end));
          setTimeout(() => {
            textarea.setSelectionRange(start + 1, start + 1 + selected.length);
          }, 0);
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
      </div>
    );
  }
);

Editor.displayName = 'Editor';
