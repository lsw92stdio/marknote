import React from 'react';
import { X, Settings, Link2, ListTree, Cloud, ArrowUpRight } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import { TOCPosition } from './TableOfContents';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  accentColor?: string;
  scrollSyncEnabled: boolean;
  onToggleScrollSync: (checked: boolean) => void;
  tocEnabled: boolean;
  onToggleToc: (checked: boolean) => void;
  tocPosition: TOCPosition;
  onChangeTocPosition: (position: TOCPosition) => void;
  userProfile: UserProfile | null;
  onOpenDriveModal: () => void;
}

const TOC_POSITION_OPTIONS: { value: TOCPosition; label: string }[] = [
  { value: 'top-left', label: '좌상단' },
  { value: 'top-right', label: '우상단' },
  { value: 'bottom-left', label: '좌하단' },
  { value: 'bottom-right', label: '우하단' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  accentColor = '#2563eb',
  scrollSyncEnabled,
  onToggleScrollSync,
  tocEnabled,
  onToggleToc,
  tocPosition,
  onChangeTocPosition,
  userProfile,
  onOpenDriveModal,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[85vh] ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className="font-bold text-base">설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Google Drive */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Cloud className="w-4 h-4 text-emerald-500" />
              <span>Google Drive</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-neutral-300">
                {userProfile ? `${userProfile.name}님 계정으로 연결됨` : '연결되지 않음'}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenDriveModal();
                }}
                className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>{userProfile ? '관리' : '연결'}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Scroll Sync */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Link2 className="w-4 h-4" style={{ color: accentColor }} />
              <span>같이보기 스크롤 동기화</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-neutral-300">
                에디터와 미리보기 스크롤을 함께 이동합니다.
              </span>
              <ToggleSwitch
                checked={scrollSyncEnabled}
                onChange={onToggleScrollSync}
                accentColor={accentColor}
                ariaLabel="같이보기 스크롤 동기화"
              />
            </div>
          </div>

          {/* Table of Contents */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <ListTree className="w-4 h-4" style={{ color: accentColor }} />
                <span>목차 (Outline)</span>
              </div>
              <ToggleSwitch
                checked={tocEnabled}
                onChange={onToggleToc}
                accentColor={accentColor}
                ariaLabel="목차 표시"
              />
            </div>

            <div className={`space-y-2 transition-opacity ${tocEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
              <div className="text-slate-600 dark:text-neutral-300">화면 위치</div>
              <div className="grid grid-cols-2 gap-2">
                {TOC_POSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onChangeTocPosition(opt.value)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium leading-tight whitespace-nowrap transition-all ${
                      tocPosition === opt.value
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
