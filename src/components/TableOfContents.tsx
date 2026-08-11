import React, { useState } from 'react';
import { ListTree, ChevronRight, ChevronDown } from 'lucide-react';
import { extractTOC } from '../utils/fileUtils';

export type TOCPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface TableOfContentsProps {
  content: string;
  isDark: boolean;
  accentColor?: string;
  enabled?: boolean;
  position?: TOCPosition;
}

const POSITION_CLASSES: Record<TOCPosition, string> = {
  'bottom-right': 'bottom-10 right-6',
  'bottom-left': 'bottom-10 left-6',
  'top-right': 'top-4 right-6',
  'top-left': 'top-4 left-6',
};

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  isDark,
  accentColor = '#2563eb',
  enabled = true,
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const items = extractTOC(content);

  if (!enabled || items.length === 0) return null;

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={`absolute z-30 transition-all ${POSITION_CLASSES[position]} ${
        isOpen ? 'w-64 shadow-xl' : 'w-auto'
      }`}
    >
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark
            ? 'bg-neutral-900/95 border-neutral-800 text-neutral-200 backdrop-blur-md'
            : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md'
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4" style={{ color: accentColor }} />
            <span>목차 (Outline)</span>
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
            >
              {items.length}
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="max-h-60 overflow-y-auto p-2 space-y-1 text-xs border-t border-slate-200 dark:border-neutral-800">
            {items.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                onClick={(e) => handleItemClick(e, item.id)}
                style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                className="block py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-[11px] truncate text-slate-700 dark:text-neutral-300 hover:font-medium"
              >
                <span
                  className="font-mono mr-1 text-[10px]"
                  style={{ color: accentColor }}
                >
                  {'#'.repeat(item.level)}
                </span>
                <span>{item.text}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
