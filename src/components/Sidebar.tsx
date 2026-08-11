import React, { useState } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Star,
  Search,
  ChevronRight,
  ChevronDown,
  Upload,
  Cloud,
  CloudCheck,
  CloudUpload,
  FolderPlus,
  FilePlus,
  FolderInput,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { MarkdownFile, Folder as FolderType } from '../types';
import { MarkNoteLogo } from './MarkNoteLogo';
import { getContrastingTextColor } from '../utils/colorUtils';
import { getDisplayName } from '../utils/fileUtils';

interface SidebarProps {
  files: MarkdownFile[];
  folders: FolderType[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (folderId?: string | null) => void;
  onCreateFolder: (name: string) => string | void;
  onDeleteFile: (fileId: string, deleteFromCloud?: boolean) => void;
  onMoveFile: (fileId: string, targetFolderId: string | null) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDuplicateFile: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenDriveModal?: () => void;
  isDriveConnected?: boolean;
  isDark: boolean;
  isOpen: boolean;
  onCloseMobile?: () => void;
  accentColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  folders,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onMoveFile,
  onRenameFile,
  onDuplicateFile,
  onToggleFavorite,
  onDeleteFolder,
  onImportFile,
  onOpenDriveModal,
  isDriveConnected,
  isDark,
  isOpen,
  onCloseMobile,
  accentColor = '#2563eb',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({
    'folder-1': true,
    'folder-2': true,
  });
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');

  // Custom Dialog States
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('새 폴더');

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'file' | 'folder';
    id: string;
    name: string;
    isSynced: boolean;
  } | null>(null);
  const [deleteFromCloud, setDeleteFromCloud] = useState(true);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [movingFile, setMovingFile] = useState<MarkdownFile | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | 'root' | null>(null);

  const toggleFolder = (folderId: string) => {
    setOpenFolderIds((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const startRenaming = (file: MarkdownFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingFileName(getDisplayName(file.name));
  };

  const submitRename = (fileId: string) => {
    if (editingFileName.trim()) {
      onRenameFile(fileId, editingFileName.trim());
    }
    setEditingFileId(null);
  };

  // Create Folder Dialog Submit
  const handleConfirmCreateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newFolderName.trim()) {
      const newFolderId = onCreateFolder(newFolderName.trim());
      if (newFolderId) {
        setOpenFolderIds((prev) => ({ ...prev, [newFolderId]: true }));
      }
    }
    setIsNewFolderModalOpen(false);
  };

  // Delete Confirm Action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'file') {
      onDeleteFile(deleteTarget.id, deleteFromCloud);
    } else {
      onDeleteFolder(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  // Request File Delete with Guard
  const handleRequestDeleteFile = (file: MarkdownFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      setAlertMessage('최소 한 개의 파일은 남겨두어야 합니다.');
      return;
    }
    setDeleteFromCloud(true);
    setDeleteTarget({ type: 'file', id: file.id, name: getDisplayName(file.name), isSynced: !!file.driveFileId });
  };

  // Request Folder Delete
  const handleRequestDeleteFolder = (folder: FolderType, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ type: 'folder', id: folder.id, name: folder.name, isSynced: false });
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = onlyFavorites ? f.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  // Get files by folder
  const rootFiles = filteredFiles.filter((f) => !f.folderId);
  const getFilesForFolder = (folderId: string) =>
    filteredFiles.filter((f) => f.folderId === folderId);

  // Filter out folders that have no matching files when searching or filtering favorites
  const displayFolders = folders.filter((folder) => {
    if (onlyFavorites || searchQuery.trim() !== '') {
      return getFilesForFolder(folder.id).length > 0;
    }
    return true;
  });

  const getSyncStatusIcon = (status?: string, isActive?: boolean) => {
    if (status === 'synced') {
      return (
        <span title="드라이브와 동기화됨">
          <CloudCheck className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-200' : 'text-emerald-500'}`} />
        </span>
      );
    }
    if (status === 'modified') {
      return (
        <span title="드라이브 업로드 필요">
          <CloudUpload className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-amber-500'}`} />
        </span>
      );
    }
    return (
      <span title="로컬 전용 파일">
        <Cloud className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-neutral-500'}`} />
      </span>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && onCloseMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:relative z-40 w-72 h-full flex flex-col transition-all duration-300 border-r shrink-0 ${
          isOpen ? 'translate-x-0 ml-0' : '-translate-x-full lg:-ml-72'
        } ${
          isDark
            ? 'bg-black border-neutral-800 text-neutral-200'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        {/* Sidebar Header - MarkNote Branding */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <MarkNoteLogo accentColor={accentColor} size="md" />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                MarkNote
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-400 mt-1 uppercase tracking-wider">
                Markdown Editor
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-slate-200 dark:border-neutral-800">
          <button
            onClick={() => onCreateFile(null)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold shadow-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor, color: getContrastingTextColor(accentColor) }}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>새 파일</span>
          </button>

          <button
            onClick={() => {
              setNewFolderName('새 폴더');
              setIsNewFolderModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>새 폴더</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 space-y-2 border-b border-slate-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="파일 또는 내용 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors ${
                onlyFavorites
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Star className={`w-3 h-3 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>즐겨찾기만</span>
            </button>

            <span className="text-slate-400 dark:text-neutral-500 font-mono text-[11px]">
              {filteredFiles.length}개 파일
            </span>
          </div>
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Folders */}
          {displayFolders.map((folder) => {
            const isExpanded = openFolderIds[folder.id];
            const folderFiles = getFilesForFolder(folder.id);
            const isDragOver = dragOverFolderId === folder.id;

            return (
              <div
                key={folder.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverFolderId(folder.id);
                }}
                onDragLeave={() => setDragOverFolderId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const fileId = e.dataTransfer.getData('text/plain');
                  if (fileId) {
                    onMoveFile(fileId, folder.id);
                    setOpenFolderIds((prev) => ({ ...prev, [folder.id]: true }));
                  }
                  setDragOverFolderId(null);
                }}
                className={`space-y-0.5 rounded-lg transition-all ${
                  isDragOver
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/60 ring-dashed p-1'
                    : ''
                }`}
              >
                <div className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-xs font-semibold cursor-pointer">
                  <div
                    className="flex items-center gap-1.5 flex-1 min-w-0"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                    ) : (
                      <Folder className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                    )}
                    <span className="truncate" title={folder.name}>{folder.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">
                      ({folderFiles.length})
                    </span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateFile(folder.id);
                        setOpenFolderIds((prev) => ({ ...prev, [folder.id]: true }));
                      }}
                      className="p-1 hover:text-blue-500 rounded hover:bg-slate-200/80 dark:hover:bg-neutral-800"
                      title="이 폴더에 새 파일 생성"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleRequestDeleteFolder(folder, e)}
                      className="p-1 hover:text-red-500 rounded hover:bg-slate-200/80 dark:hover:bg-neutral-800"
                      title="폴더 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Folder Items */}
                {isExpanded && (
                  <div className="pl-4 space-y-0.5">
                    {folderFiles.length === 0 ? (
                      <div className="py-1 px-3 text-[11px] text-slate-400 italic">
                        빈 폴더 (드래그하여 파일 이동 가능)
                      </div>
                    ) : (
                      folderFiles.map((file) => (
                        <FileItem
                          key={file.id}
                          file={file}
                          isActive={file.id === activeFileId}
                          isEditing={editingFileId === file.id}
                          editingName={editingFileName}
                          onEditingNameChange={setEditingFileName}
                          onSubmitRename={() => submitRename(file.id)}
                          onSelect={() => onSelectFile(file.id)}
                          onStartRename={(e) => startRenaming(file, e)}
                          onDelete={(e) => handleRequestDeleteFile(file, e)}
                          onDuplicate={() => onDuplicateFile(file.id)}
                          onToggleFavorite={() => onToggleFavorite(file.id)}
                          onOpenMoveModal={() => setMovingFile(file)}
                          syncIcon={getSyncStatusIcon(file.syncStatus, file.id === activeFileId)}
                          accentColor={accentColor}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Root Files */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverFolderId('root');
            }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => {
              e.preventDefault();
              const fileId = e.dataTransfer.getData('text/plain');
              if (fileId) {
                onMoveFile(fileId, null);
              }
              setDragOverFolderId(null);
            }}
            className={`pt-2 space-y-0.5 rounded-lg transition-all ${
              dragOverFolderId === 'root'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/60 ring-dashed p-1'
                : ''
            }`}
          >
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>일반 파일 (최상위)</span>
              {dragOverFolderId === 'root' && (
                <span className="text-[10px] text-blue-500 font-normal">이곳으로 이동</span>
              )}
            </div>
            {rootFiles.length === 0 ? (
              <div className="py-2 px-3 text-[11px] text-slate-400 italic">
                일반 파일이 없습니다.
              </div>
            ) : (
              rootFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  isActive={file.id === activeFileId}
                  isEditing={editingFileId === file.id}
                  editingName={editingFileName}
                  onEditingNameChange={setEditingFileName}
                  onSubmitRename={() => submitRename(file.id)}
                  onSelect={() => onSelectFile(file.id)}
                  onStartRename={(e) => startRenaming(file, e)}
                  onDelete={(e) => handleRequestDeleteFile(file, e)}
                  onDuplicate={() => onDuplicateFile(file.id)}
                  onToggleFavorite={() => onToggleFavorite(file.id)}
                  onOpenMoveModal={() => setMovingFile(file)}
                  syncIcon={getSyncStatusIcon(file.syncStatus, file.id === activeFileId)}
                  accentColor={accentColor}
                />
              ))
            )}
          </div>
        </div>

        {/* Local Import & Google Drive Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-neutral-800 text-xs space-y-2">
          {/* Import Local Markdown */}
          <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-neutral-700 hover:bg-slate-200/50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors text-slate-600 dark:text-neutral-300 font-medium">
            <Upload className="w-3.5 h-3.5" />
            <span>내 컴퓨터 파일 불러오기 (.md)</span>
            <input
              type="file"
              accept=".md,.txt,.markdown"
              onChange={onImportFile}
              className="hidden"
            />
          </label>

          {/* Google Drive Status Button */}
          {onOpenDriveModal && (
            <button
              onClick={onOpenDriveModal}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-xl font-medium transition-colors ${
                isDriveConnected
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cloud className={`w-4 h-4 ${isDriveConnected ? 'text-emerald-500' : ''}`} />
                <span>{isDriveConnected ? 'Google Drive 연동됨' : 'Google Drive 클라우드'}</span>
              </div>
              <span className="text-[11px] font-semibold underline">
                {isDriveConnected ? '설정' : '연결'}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* MODAL 1: Create New Folder Dialog */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <FolderPlus className="w-4 h-4" style={{ color: accentColor }} />
                <span>새 폴더 만들기</span>
              </div>
              <button
                onClick={() => setIsNewFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1.5">
                  폴더 이름
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="예: 업무 문서, 개인 아이디어"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {deleteTarget.type === 'file' ? '파일 삭제' : '폴더 삭제'}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-neutral-400">
                  정말 <strong className="text-slate-800 dark:text-neutral-200">'{deleteTarget.name}'</strong>{deleteTarget.type === 'file' ? '을(를) 삭제하시겠습니까?' : ' 폴더를 삭제하시겠습니까?'}
                </p>
                {deleteTarget.type === 'folder' && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    * 폴더 내부의 파일은 삭제되지 않으며 최상위 루트 위치로 이동됩니다.
                  </p>
                )}
              </div>
            </div>

            {deleteTarget.type === 'file' && deleteTarget.isSynced && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteFromCloud}
                  onChange={(e) => setDeleteFromCloud(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-red-600"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-neutral-300">
                  Google Drive에 동기화된 파일도 함께 삭제
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: General Alert Dialog */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4 text-center">
            <p className="text-xs font-medium text-slate-800 dark:text-neutral-200 py-2">
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Move File Modal Selector */}
      {movingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <FolderInput className="w-4 h-4" style={{ color: accentColor }} />
                <span>폴더로 이동</span>
              </div>
              <button
                onClick={() => setMovingFile(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
              이동할 파일: <strong className="text-slate-800 dark:text-neutral-200">{getDisplayName(movingFile.name)}</strong>
            </p>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {/* Option: Root */}
              <button
                type="button"
                onClick={() => {
                  onMoveFile(movingFile.id, null);
                  setMovingFile(null);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-colors border ${
                  movingFile.folderId === null
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>일반 파일 (최상위 루트)</span>
                </div>
                {movingFile.folderId === null && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              {/* Option: Available Folders */}
              {folders.map((f) => {
                const isCurrent = movingFile.folderId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onMoveFile(movingFile.id, f.id);
                      setOpenFolderIds((prev) => ({ ...prev, [f.id]: true }));
                      setMovingFile(null);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-colors border ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" style={{ color: accentColor }} />
                      <span>{f.name}</span>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setMovingFile(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Subcomponent for individual file item
interface FileItemProps {
  file: MarkdownFile;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  onEditingNameChange: (val: string) => void;
  onSubmitRename: () => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onOpenMoveModal: () => void;
  syncIcon: React.ReactNode;
  accentColor?: string;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  isActive,
  isEditing,
  editingName,
  onEditingNameChange,
  onSubmitRename,
  onSelect,
  onStartRename,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onOpenMoveModal,
  syncIcon,
  accentColor = '#2563eb',
}) => {
  const textColor = getContrastingTextColor(accentColor);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', file.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onSelect}
      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-grab active:cursor-grabbing transition-colors ${
        isActive
          ? 'font-medium shadow-xs'
          : 'hover:bg-slate-200/70 dark:hover:bg-neutral-800/80 text-slate-700 dark:text-neutral-300'
      }`}
      style={isActive ? { backgroundColor: accentColor, color: textColor } : {}}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
        <FileText
          className="w-3.5 h-3.5 shrink-0"
          style={isActive ? { color: textColor } : { color: accentColor }}
        />

        {isEditing ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onBlur={onSubmitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitRename();
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="w-full px-1 py-0.5 text-xs rounded bg-white text-slate-900 border border-blue-500 focus:outline-none"
          />
        ) : (
          <span className="truncate" title={getDisplayName(file.name)}>{getDisplayName(file.name)}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Sync Status */}
        <span className="shrink-0">{syncIcon}</span>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-0.5 ${
            file.isFavorite
              ? isActive
                ? 'text-amber-300 hover:text-amber-200'
                : 'text-amber-400 hover:text-amber-500'
              : isActive
              ? 'opacity-0 group-hover:opacity-100 text-white/80 hover:text-white'
              : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400'
          }`}
          title="즐겨찾기 토글"
        >
          <Star className={`w-3 h-3 ${file.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* More Actions on Hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMoveModal();
            }}
            className={`p-1 rounded transition-colors ${
              isActive
                ? 'text-white/80 hover:text-white hover:bg-white/20'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-neutral-800'
            }`}
            title="폴더로 이동"
          >
            <FolderInput className="w-3 h-3" />
          </button>
          <button
            onClick={onStartRename}
            className={`p-1 rounded transition-colors ${
              isActive
                ? 'text-white/80 hover:text-white hover:bg-white/20'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-neutral-800'
            }`}
            title="이름 변경"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className={`p-1 rounded transition-colors ${
              isActive
                ? 'text-white/80 hover:text-white hover:bg-white/20'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-neutral-800'
            }`}
            title="복제"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className={`p-1 rounded transition-colors ${
              isActive
                ? 'text-red-200 hover:text-red-100 hover:bg-white/20'
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-200/60 dark:hover:bg-neutral-800'
            }`}
            title="삭제"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
