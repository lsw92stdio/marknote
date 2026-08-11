import React, { useState } from 'react';
import {
  Columns,
  Code2,
  Eye,
  Sun,
  Moon,
  Square,
  Palette,
  Download,
  Menu,
  FileText,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { ViewMode, AppTheme } from '../types';
import { getContrastingTextColor } from '../utils/colorUtils';
import { getDisplayName } from '../utils/fileUtils';

interface HeaderProps {
  fileName: string;
  onRenameActiveFile: (newName: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenStyleCustomizer: () => void;
  onOpenExportModal: () => void;
  onOpenHelpModal?: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isDark: boolean;
  accentColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  onRenameActiveFile,
  viewMode,
  onChangeViewMode,
  theme,
  onToggleTheme,
  onOpenStyleCustomizer,
  onOpenExportModal,
  onOpenHelpModal,
  onOpenSettings,
  onToggleSidebar,
  isDark,
  accentColor = '#2563eb',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(getDisplayName(fileName));

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onRenameActiveFile(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-black text-slate-800 dark:text-neutral-100 select-none z-30 transition-colors">
      {/* Left: Sidebar Toggle & File Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 transition-colors"
          title="사이드바 토글"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
              }}
              autoFocus
              className="px-2 py-0.5 text-sm font-semibold rounded bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border focus:outline-none"
              style={{ borderColor: accentColor }}
            />
          ) : (
            <h1
              onClick={() => {
                setTempTitle(getDisplayName(fileName));
                setIsEditingTitle(true);
              }}
              className="text-sm font-bold text-slate-800 dark:text-neutral-100 truncate cursor-pointer hover:underline decoration-dashed underline-offset-4"
              title={`${getDisplayName(fileName)} (클릭하여 이름 변경)`}
            >
              {getDisplayName(fileName)}
            </h1>
          )}
        </div>
      </div>

      {/* Middle: View Mode Selector - Desktop & Mobile Responsive */}
      {/* Desktop Mode (md+) */}
      <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-medium">
        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            viewMode === 'split'
              ? 'bg-white dark:bg-neutral-800 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
          style={viewMode === 'split' ? { color: accentColor } : {}}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>나눠보기 (Split)</span>
        </button>

        <button
          onClick={() => onChangeViewMode('editor')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            viewMode === 'editor'
              ? 'bg-white dark:bg-neutral-800 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
          style={viewMode === 'editor' ? { color: accentColor } : {}}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>에디터만</span>
        </button>

        <button
          onClick={() => onChangeViewMode('preview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            viewMode === 'preview'
              ? 'bg-white dark:bg-neutral-800 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
          style={viewMode === 'preview' ? { color: accentColor } : {}}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>결과물만</span>
        </button>
      </div>

      {/* Mobile Mode Compact View Switcher (< md) */}
      <div className="flex md:hidden items-center p-0.5 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs">
        <button
          onClick={() => onChangeViewMode('editor')}
          className={`p-1.5 rounded transition-all ${
            viewMode === 'editor' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'text-slate-500 dark:text-neutral-400'
          }`}
          style={viewMode === 'editor' ? { color: accentColor } : {}}
          title="에디터만 보기"
        >
          <Code2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChangeViewMode('split')}
          className={`p-1.5 rounded transition-all ${
            viewMode === 'split' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'text-slate-500 dark:text-neutral-400'
          }`}
          style={viewMode === 'split' ? { color: accentColor } : {}}
          title="나눠보기"
        >
          <Columns className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChangeViewMode('preview')}
          className={`p-1.5 rounded transition-all ${
            viewMode === 'preview' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'text-slate-500 dark:text-neutral-400'
          }`}
          style={viewMode === 'preview' ? { color: accentColor } : {}}
          title="미리보기만 보기"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions (Style Customizer, Export, Settings, Dark mode) */}
      <div className="flex items-center gap-2">
        {/* Style Customizer */}
        <button
          onClick={onOpenStyleCustomizer}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors shadow-xs"
          title="결과물 디자인 & 강조 색상 고르기"
        >
          <Palette className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="hidden sm:inline">스타일 커스텀</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors shadow-xs"
          title="설정"
        >
          <Settings className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="hidden sm:inline">설정</span>
        </button>

        {/* Export Button - Bound to Accent Color */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold shadow-xs transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor, color: getContrastingTextColor(accentColor) }}
          title="내보내기 (.md, .txt, .html, 이미지)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">내보내기</span>
        </button>

        {/* Help Button */}
        {onOpenHelpModal && (
          <button
            onClick={onOpenHelpModal}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors shadow-xs"
            title="마크다운 작성 도움말 & 단축키"
          >
            <HelpCircle className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="hidden xl:inline">도움말</span>
          </button>
        )}

        <div className="w-px h-4 bg-slate-200 dark:bg-neutral-800 mx-0.5" />

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors"
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드(블랙)로 전환'}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-neutral-200 fill-neutral-200" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-700 dark:text-neutral-300">
            {theme === 'dark' ? '다크 모드' : '라이트 모드'}
          </span>
        </button>
      </div>
    </header>
  );
};
