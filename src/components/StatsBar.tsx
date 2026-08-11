import React from 'react';
import { CloudCheck, CloudUpload, Cloud, RefreshCw, AlertTriangle, Clock, FileText, Hash } from 'lucide-react';
import { calculateTextStats } from '../utils/fileUtils';

interface StatsBarProps {
  content: string;
  cursorLine: number;
  cursorCol: number;
  syncStatus?: string;
  onRetrySync?: () => void;
  isDark: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  content,
  cursorLine,
  cursorCol,
  syncStatus,
  onRetrySync,
  isDark,
}) => {
  const stats = calculateTextStats(content);

  return (
    <footer
      className={`h-7 px-4 flex items-center justify-between text-[11px] font-mono border-t select-none z-20 ${
        isDark
          ? 'bg-black border-neutral-800 text-neutral-400'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      {/* Left: Line and Column */}
      <div className="flex items-center gap-4">
        <span title="현재 커서 위치">
          Ln {cursorLine}, Col {cursorCol}
        </span>
        <span className="hidden sm:inline opacity-40">|</span>
        <span className="hidden sm:flex items-center gap-1" title="총 줄 수">
          <Hash className="w-3 h-3 text-slate-400" />
          <span>{stats.lines}줄</span>
        </span>
      </div>

      {/* Middle: Word & Character Counts */}
      <div className="flex items-center gap-3">
        <span>{stats.chars.toLocaleString()} 자</span>
        <span className="opacity-40">(공백제외 {stats.charsNoSpaces.toLocaleString()})</span>
        <span className="hidden md:inline opacity-40">|</span>
        <span className="hidden md:inline">{stats.words.toLocaleString()} 단어</span>
        <span className="hidden md:inline opacity-40">|</span>
        <span className="hidden md:flex items-center gap-1" title="예상 읽기 시간">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>약 {stats.readTimeMin}분</span>
        </span>
      </div>

      {/* Right: Sync Badge */}
      <div className="flex items-center gap-1.5 font-sans">
        {syncStatus === 'syncing' ? (
          <span className="flex items-center gap-1 text-sky-500 font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">동기화 중...</span>
          </span>
        ) : syncStatus === 'synced' ? (
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <CloudCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Drive 동기화됨</span>
          </span>
        ) : syncStatus === 'error' ? (
          <button
            onClick={onRetrySync}
            className="flex items-center gap-1 text-red-500 hover:text-red-400 font-medium cursor-pointer"
            title="클릭하여 다시 시도 (자동으로도 잠시 후 재시도합니다)"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">동기화 실패 · 재시도</span>
          </button>
        ) : syncStatus === 'modified' ? (
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <CloudUpload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">저장 대기 중</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400">
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">로컬 저장</span>
          </span>
        )}
      </div>
    </footer>
  );
};
