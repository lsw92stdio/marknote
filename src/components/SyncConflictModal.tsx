import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  HardDrive,
  Cloud,
  FileText,
  Check,
  ShieldCheck,
  X,
} from 'lucide-react';
import { MarkdownFile } from '../types';
import { DriveFileInfo } from '../utils/driveApi';
import { getDisplayName } from '../utils/fileUtils';

export interface ConflictData {
  localFile: MarkdownFile;
  cloudFile: DriveFileInfo;
  cloudContent?: string;
}

interface SyncConflictModalProps {
  isOpen: boolean;
  conflict: ConflictData | null;
  onResolve: (action: 'keep_local' | 'keep_cloud', createBackup: boolean) => void;
  onCancel: () => void;
  accentColor?: string;
  isDark?: boolean;
}

export const SyncConflictModal: React.FC<SyncConflictModalProps> = ({
  isOpen,
  conflict,
  onResolve,
  onCancel,
  accentColor = '#2563eb',
  isDark = false,
}) => {
  const [createBackup, setCreateBackup] = useState(true);

  if (!isOpen || !conflict) return null;

  const { localFile, cloudFile } = conflict;

  const formatDate = (dateInput: number | string) => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return String(dateInput);
    }
  };

  const localTimeStr = formatDate(localFile.updatedAt);
  const cloudTimeStr = formatDate(cloudFile.modifiedTime);

  // Compare timestamps
  const localTime = new Date(localFile.updatedAt).getTime();
  const cloudTime = new Date(cloudFile.modifiedTime).getTime();
  const isCloudNewer = cloudTime > localTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                클라우드 동기화 파일 충돌 감지
              </h2>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                로컬 파일과 Google Drive 파일의 변경 시각이 다릅니다.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          <p className="text-slate-600 dark:text-neutral-300 text-xs leading-relaxed">
            원하는 파일 버전을 선택하여 동기화를 진행해주세요. 각 파일의 최근 수정 시각을 직접 확인하실 수 있습니다.
          </p>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Local Version Card */}
            <div
              className={`p-3.5 rounded-xl border relative transition-all ${
                !isCloudNewer
                  ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/80 ring-2 ring-blue-500/40'
                  : 'bg-slate-50/70 dark:bg-neutral-900/70 border-slate-200 dark:border-neutral-800'
              }`}
            >
              {!isCloudNewer && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                  최신 수정됨
                </span>
              )}
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-2">
                <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                <span>내 컴퓨터 (로컬 버전)</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-neutral-400">
                <div className="truncate font-medium text-slate-800 dark:text-neutral-200">
                  📄 {getDisplayName(localFile.name)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{localTimeStr}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  크기: 약 {localFile.content.length} 글자
                </div>
              </div>
            </div>

            {/* Cloud Drive Version Card */}
            <div
              className={`p-3.5 rounded-xl border relative transition-all ${
                isCloudNewer
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 ring-2 ring-emerald-500/40'
                  : 'bg-slate-50/70 dark:bg-neutral-900/70 border-slate-200 dark:border-neutral-800'
              }`}
            >
              {isCloudNewer && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                  최신 수정됨
                </span>
              )}
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-2">
                <Cloud className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Google Drive (클라우드)</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-neutral-400">
                <div className="truncate font-medium text-slate-800 dark:text-neutral-200">
                  ☁️ {getDisplayName(cloudFile.name)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{cloudTimeStr}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  구글 드라이브 동기화본
                </div>
              </div>
            </div>
          </div>

          {/* Backup Checkbox Option */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createBackup}
                onChange={(e) => setCreateBackup(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 dark:text-neutral-200 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  덮어쓰기 전 이전 로컬 파일을 사본 백업으로 보관
                </span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  예: <code className="bg-slate-200 dark:bg-neutral-800 px-1 rounded text-[10px]">[백업]_{getDisplayName(localFile.name)}</code> 파일 자동 생성
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-neutral-900/80 border-t border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-colors"
          >
            동기화 취소
          </button>

          <button
            type="button"
            onClick={() => onResolve('keep_local', createBackup)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: accentColor }}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>로컬 버전 유지 (클라우드 덮어쓰기)</span>
          </button>

          <button
            type="button"
            onClick={() => onResolve('keep_cloud', createBackup)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>클라우드 버전 수용 (로컬 덮어쓰기)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
