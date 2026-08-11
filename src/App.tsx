import React, { useState, useEffect, useRef } from 'react';
import { MarkdownFile, Folder, PreviewStyleConfig, ViewMode, AppTheme, UserProfile } from './types';
import { INITIAL_FILES, INITIAL_FOLDERS } from './data/initialSamples';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { Editor, EditorRef } from './components/Editor';
import { Preview, PreviewRef } from './components/Preview';
import { StyleCustomizer } from './components/StyleCustomizer';
import { ExportModal } from './components/ExportModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { HelpModal } from './components/HelpModal';
import { StatsBar } from './components/StatsBar';
import { TableOfContents, TOCPosition } from './components/TableOfContents';
import { SettingsModal } from './components/SettingsModal';
import {
  saveFileToDrive,
  getOrCreateDriveFolder,
  deleteDriveFile,
  findMetaFileId,
  saveMetaToDrive,
  downloadDriveFileContent,
  DriveMeta,
} from './utils/driveApi';
import { getEffectiveAccentColor } from './utils/colorUtils';

const DEFAULT_STYLE_CONFIG: PreviewStyleConfig = {
  boldColor: '#ef4444', // Main theme accent color
  headingColor: 'default',
  fontFamily: 'sans',
  codeTheme: 'github-dark',
  fontSize: 'base',
  lineHeight: 'normal',
};

const GOOGLE_CLIENT_ID = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) || '';

export default function App() {
  // LocalStorage state initializers
  const [files, setFiles] = useState<MarkdownFile[]>(() => {
    const saved = localStorage.getItem('md_editor_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('md_editor_folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const savedActive = localStorage.getItem('md_editor_active_id');
    return savedActive && files.some((f) => f.id === savedActive)
      ? savedActive
      : files[0]?.id || 'file-welcome';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [theme, setTheme] = useState<AppTheme>(() => {
    const savedTheme = localStorage.getItem('md_editor_theme') as AppTheme;
    return savedTheme || 'dark';
  });

  const [styleConfig, setStyleConfig] = useState<PreviewStyleConfig>(() => {
    const savedStyle = localStorage.getItem('md_editor_style_config');
    return savedStyle ? JSON.parse(savedStyle) : DEFAULT_STYLE_CONFIG;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('md_editor_user_profile');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('md_editor_auto_sync') === 'true';
  });

  const [scrollSyncEnabled, setScrollSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('md_editor_scroll_sync');
    return saved === null ? true : saved === 'true';
  });

  const [tocEnabled, setTocEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('md_editor_toc_enabled');
    return saved === null ? true : saved === 'true';
  });

  const [tocPosition, setTocPosition] = useState<TOCPosition>(() => {
    return (localStorage.getItem('md_editor_toc_position') as TOCPosition) || 'bottom-right';
  });

  // UI Modals
  const [isStyleCustomizerOpen, setIsStyleCustomizerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Editor cursor position
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isSyncing, setIsSyncing] = useState(false);

  const editorRef = useRef<EditorRef>(null);
  const previewRef = useRef<PreviewRef>(null);
  const isSyncingScrollRef = useRef(false);
  const metaFileIdRef = useRef<string | null>(null);

  const isDark = theme === 'dark';

  // Sync dark class and CSS accent variable to html document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-black');
    if (isDark) {
      root.classList.add('dark');
    }
    root.style.setProperty('--accent-color', styleConfig.boldColor);
    localStorage.setItem('md_editor_theme', theme);
  }, [theme, isDark, styleConfig.boldColor]);

  // Persist files to localStorage
  useEffect(() => {
    localStorage.setItem('md_editor_files', JSON.stringify(files));
  }, [files]);

  // Persist folders to localStorage
  useEffect(() => {
    localStorage.setItem('md_editor_folders', JSON.stringify(folders));
  }, [folders]);

  // Persist active file ID
  useEffect(() => {
    localStorage.setItem('md_editor_active_id', activeFileId);
  }, [activeFileId]);

  // Persist style config
  useEffect(() => {
    localStorage.setItem('md_editor_style_config', JSON.stringify(styleConfig));
  }, [styleConfig]);

  // Persist User Profile
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('md_editor_user_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('md_editor_user_profile');
    }
  }, [userProfile]);

  // Persist Auto Sync setting
  useEffect(() => {
    localStorage.setItem('md_editor_auto_sync', String(autoSyncEnabled));
  }, [autoSyncEnabled]);

  // Persist Scroll Sync setting
  useEffect(() => {
    localStorage.setItem('md_editor_scroll_sync', String(scrollSyncEnabled));
  }, [scrollSyncEnabled]);

  // Persist TOC settings
  useEffect(() => {
    localStorage.setItem('md_editor_toc_enabled', String(tocEnabled));
  }, [tocEnabled]);

  useEffect(() => {
    localStorage.setItem('md_editor_toc_position', tocPosition);
  }, [tocPosition]);

  // Split-view Scroll Sync Handlers
  const handleEditorScroll = (ratio: number) => {
    if (!scrollSyncEnabled || isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    previewRef.current?.scrollToRatio(ratio);
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  const handlePreviewScroll = (ratio: number) => {
    if (!scrollSyncEnabled || isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    editorRef.current?.scrollToRatio(ratio);
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  // Load & Merge Folder/Favorite Metadata on Drive Connect
  useEffect(() => {
    const accessToken = userProfile?.accessToken;
    if (!accessToken) {
      metaFileIdRef.current = null;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const driveFolderId = await getOrCreateDriveFolder(accessToken);
        const foundMetaId = await findMetaFileId(accessToken, driveFolderId);
        if (cancelled) return;
        metaFileIdRef.current = foundMetaId;
        if (!foundMetaId) return;

        const raw = await downloadDriveFileContent(accessToken, foundMetaId);
        if (cancelled) return;
        const meta = JSON.parse(raw) as DriveMeta;

        setFolders((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const merged = [...prev];
          meta.folders?.forEach((rf) => {
            if (!existingIds.has(rf.id)) merged.push(rf);
          });
          return merged;
        });

        setFiles((prev) =>
          prev.map((f) => {
            if (!f.driveFileId) return f;
            const remoteMeta = meta.fileMeta?.[f.driveFileId];
            if (!remoteMeta) return f;
            return { ...f, folderId: remoteMeta.folderId, isFavorite: remoteMeta.isFavorite };
          })
        );
      } catch (err) {
        console.error('Meta load error:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userProfile?.accessToken]);

  // Debounced Metadata Upload (folder structure + favorites) — keyed off structural changes only, not content
  const fileMetaFingerprint = files
    .map((f) => `${f.driveFileId || ''}:${f.folderId || ''}:${f.isFavorite ? 1 : 0}`)
    .join(',');

  useEffect(() => {
    if (!autoSyncEnabled || !userProfile?.accessToken) return;

    const timer = setTimeout(async () => {
      try {
        const accessToken = userProfile.accessToken!;
        const driveFolderId = await getOrCreateDriveFolder(accessToken);
        const fileMeta: DriveMeta['fileMeta'] = {};
        files.forEach((f) => {
          if (f.driveFileId) {
            fileMeta[f.driveFileId] = { folderId: f.folderId, isFavorite: !!f.isFavorite };
          }
        });
        const result = await saveMetaToDrive(
          accessToken,
          driveFolderId,
          { folders, fileMeta },
          metaFileIdRef.current
        );
        metaFileIdRef.current = result.id;
      } catch (err) {
        console.error('Meta sync error:', err);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [folders, fileMetaFingerprint, autoSyncEnabled, userProfile?.accessToken]);

  // Active File Reference
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Auto-Sync Debounce to Google Drive
  useEffect(() => {
    if (!autoSyncEnabled || !userProfile?.accessToken || !activeFile) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFile.id ? { ...f, syncStatus: 'syncing' } : f))
      );

      try {
        const folderId = await getOrCreateDriveFolder(userProfile.accessToken!);
        const res = await saveFileToDrive(
          userProfile.accessToken!,
          folderId,
          activeFile.name,
          activeFile.content,
          activeFile.driveFileId
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === activeFile.id
              ? {
                  ...f,
                  driveFileId: res.id,
                  lastSyncedAt: Date.now(),
                  syncStatus: 'synced',
                }
              : f
          )
        );
      } catch (err) {
        console.error('Auto sync error:', err);
        setFiles((prev) =>
          prev.map((f) => (f.id === activeFile.id ? { ...f, syncStatus: 'error' } : f))
        );
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // Debounce — short enough that the status bar reflects changes promptly

    return () => clearTimeout(timer);
  }, [activeFile?.content, autoSyncEnabled, userProfile?.accessToken]);

  // Active File Content Updater
  const handleContentChange = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? {
              ...f,
              content: newContent,
              updatedAt: Date.now(),
              syncStatus: userProfile ? 'modified' : 'local_only',
            }
          : f
      )
    );
  };

  // File Management Actions
  const handleCreateFile = (folderId: string | null = null) => {
    const newFile: MarkdownFile = {
      id: `file-${Date.now()}`,
      name: `새 문서 ${files.length + 1}.md`,
      content: `# 새 마크다운 문서\n\n내용을 여기에 작성하세요...`,
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'local_only',
    };

    setFiles((prev) => [newFile, ...prev]);
    setActiveFileId(newFile.id);
  };

  const handleCreateFolder = (name: string) => {
    const folderName = name.trim() || '새 폴더';
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      parentId: null,
      createdAt: Date.now(),
    };

    setFolders((prev) => [...prev, newFolder]);
    return newFolder.id;
  };

  const handleMoveFile = (fileId: string, targetFolderId: string | null) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, folderId: targetFolderId, updatedAt: Date.now() } : f
      )
    );
  };

  const handleDeleteFile = (fileId: string, deleteFromCloud: boolean = true) => {
    const target = files.find((f) => f.id === fileId);

    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    if (activeFileId === fileId && updatedFiles.length > 0) {
      setActiveFileId(updatedFiles[0].id);
    }

    if (deleteFromCloud && target?.driveFileId && userProfile?.accessToken) {
      deleteDriveFile(userProfile.accessToken, target.driveFileId).catch((err) => {
        console.error('Drive delete error:', err);
      });
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    const formattedName = newName.endsWith('.md') ? newName : `${newName}.md`;
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: formattedName } : f))
    );
  };

  const handleDuplicateFile = (fileId: string) => {
    const target = files.find((f) => f.id === fileId);
    if (!target) return;

    const dupFile: MarkdownFile = {
      ...target,
      id: `file-${Date.now()}`,
      name: target.name.replace(/\.md$/, '') + '_사본.md',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      driveFileId: undefined,
      syncStatus: 'local_only',
    };

    setFiles((prev) => [dupFile, ...prev]);
    setActiveFileId(dupFile.id);
  };

  const handleToggleFavorite = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((fold) => fold.id !== folderId));
    setFiles((prev) =>
      prev.map((f) => (f.folderId === folderId ? { ...f, folderId: null } : f))
    );
  };

  // Import Local .md File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const importedFile: MarkdownFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        content: text || '',
        folderId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'local_only',
      };

      setFiles((prev) => [importedFile, ...prev]);
      setActiveFileId(importedFile.id);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Sync Single File to Drive Callback
  const handleSyncFileCallback = (fileId: string, driveFileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              driveFileId,
              lastSyncedAt: Date.now(),
              syncStatus: 'synced',
            }
          : f
      )
    );
  };

  // Import Drive File to App
  const handleImportDriveFile = (name: string, content: string, driveFileId: string) => {
    const existing = files.find((f) => f.driveFileId === driveFileId);
    if (existing) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === existing.id
            ? {
                ...f,
                name,
                content,
                updatedAt: Date.now(),
                syncStatus: 'synced',
              }
            : f
        )
      );
      setActiveFileId(existing.id);
    } else {
      const newDriveFile: MarkdownFile = {
        id: `file-${Date.now()}`,
        name,
        content,
        folderId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        driveFileId,
        syncStatus: 'synced',
      };
      setFiles((prev) => [newDriveFile, ...prev]);
      setActiveFileId(newDriveFile.id);
    }
  };

  // Backup Local File for Conflict Resolution
  const handleBackupLocalFile = (file: MarkdownFile) => {
    const d = new Date();
    const timestamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    const baseName = file.name.replace(/\.md$/, '');
    const backupFile: MarkdownFile = {
      ...file,
      id: `backup-${Date.now()}`,
      name: `[백업]_${baseName}_${timestamp}.md`,
      driveFileId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'local_only',
    };
    setFiles((prev) => [backupFile, ...prev]);
  };

  // Overwrite Local File with Cloud Version
  const handleOverwriteLocalFile = (fileId: string, content: string, driveFileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              content,
              driveFileId,
              updatedAt: Date.now(),
              lastSyncedAt: Date.now(),
              syncStatus: 'synced',
            }
          : f
      )
    );
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const effectiveAccentColor = getEffectiveAccentColor(styleConfig.boldColor, isDark);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-neutral-100 font-sans">
      {/* File Manager Sidebar */}
      <Sidebar
        files={files}
        folders={folders}
        activeFileId={activeFileId}
        onSelectFile={setActiveFileId}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onDeleteFile={handleDeleteFile}
        onMoveFile={handleMoveFile}
        onRenameFile={handleRenameFile}
        onDuplicateFile={handleDuplicateFile}
        onToggleFavorite={handleToggleFavorite}
        onDeleteFolder={handleDeleteFolder}
        onImportFile={handleImportFile}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        isDriveConnected={!!userProfile}
        isDark={isDark}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        accentColor={effectiveAccentColor}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Navigation Header */}
        <Header
          fileName={activeFile?.name || '문서'}
          onRenameActiveFile={(newName) =>
            activeFile && handleRenameFile(activeFile.id, newName)
          }
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenStyleCustomizer={() => setIsStyleCustomizerOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDark={isDark}
          accentColor={effectiveAccentColor}
        />

        {/* Editor & Preview Panes Layout */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Editor Formatting Toolbar */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <Toolbar
              onInsert={(prefix, suffix, defaultText) =>
                editorRef.current?.insertText(prefix, suffix, defaultText)
              }
            />
          )}

          {/* Core Panes Container */}
          <div className={`flex-1 flex min-h-0 ${
            viewMode === 'split' ? 'flex-col md:flex-row divide-y md:divide-y-0 md:divide-x' : ''
          } divide-slate-200 dark:divide-neutral-800 overflow-y-auto md:overflow-hidden`}>
            {/* Editor Pane */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <div
                className={`${
                  viewMode === 'split' ? 'w-full h-1/2 md:w-1/2 md:h-full' : 'w-full h-full'
                } flex flex-col min-w-0 min-h-[200px]`}
              >
                <Editor
                  ref={editorRef}
                  value={activeFile?.content || ''}
                  onChange={handleContentChange}
                  isDark={isDark}
                  onCursorChange={(line, col) => setCursorPos({ line, col })}
                  onScroll={viewMode === 'split' ? handleEditorScroll : undefined}
                />
              </div>
            )}

            {/* Preview Pane */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div
                className={`${
                  viewMode === 'split' ? 'w-full h-1/2 md:w-1/2 md:h-full' : 'w-full h-full'
                } min-w-0 relative min-h-[200px]`}
              >
                <Preview
                  ref={previewRef}
                  content={activeFile?.content || ''}
                  styleConfig={styleConfig}
                  isDark={isDark}
                  onScroll={viewMode === 'split' ? handlePreviewScroll : undefined}
                />

                {/* Table of Contents Floating Widget — hidden while Settings is open to avoid the same TOC UI appearing twice on screen */}
                <TableOfContents
                  content={activeFile?.content || ''}
                  isDark={isDark}
                  accentColor={effectiveAccentColor}
                  enabled={tocEnabled && !isSettingsModalOpen}
                  position={tocPosition}
                />
              </div>
            )}

            {/* Offscreen Preview fallback when in Editor-only mode for export */}
            {viewMode === 'editor' && (
              <div className="fixed -top-[9999px] -left-[9999px] w-[850px] pointer-events-none opacity-0 overflow-hidden">
                <Preview
                  content={activeFile?.content || ''}
                  styleConfig={styleConfig}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <StatsBar
          content={activeFile?.content || ''}
          cursorLine={cursorPos.line}
          cursorCol={cursorPos.col}
          syncStatus={activeFile?.syncStatus}
          isDark={isDark}
        />
      </div>

      {/* Style Customizer Drawer */}
      <StyleCustomizer
        styleConfig={styleConfig}
        onChangeStyleConfig={setStyleConfig}
        isOpen={isStyleCustomizerOpen}
        onClose={() => setIsStyleCustomizerOpen(false)}
        isDark={isDark}
      />

      {/* Export Modal */}
      <ExportModal
        fileName={activeFile?.name || 'document.md'}
        content={activeFile?.content || ''}
        styleConfig={styleConfig}
        isDark={isDark}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        isDark={isDark}
        accentColor={effectiveAccentColor}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDark={isDark}
        accentColor={effectiveAccentColor}
        scrollSyncEnabled={scrollSyncEnabled}
        onToggleScrollSync={setScrollSyncEnabled}
        tocEnabled={tocEnabled}
        onToggleToc={setTocEnabled}
        tocPosition={tocPosition}
        onChangeTocPosition={setTocPosition}
        userProfile={userProfile}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
      />

      {/* Google Drive Sync Modal */}
      <GoogleDriveModal
        clientId={GOOGLE_CLIENT_ID}
        userProfile={userProfile}
        onUpdateUserProfile={setUserProfile}
        files={files}
        onSyncFile={handleSyncFileCallback}
        onImportDriveFile={handleImportDriveFile}
        onOverwriteLocalFile={handleOverwriteLocalFile}
        onBackupLocalFile={handleBackupLocalFile}
        isDark={isDark}
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={() => setAutoSyncEnabled(!autoSyncEnabled)}
        accentColor={effectiveAccentColor}
      />
    </div>
  );
}
