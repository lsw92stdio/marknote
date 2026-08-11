import React, { useState } from 'react';
import {
  X,
  Cloud,
  RefreshCw,
  Upload,
  Download,
  LogOut,
  AlertCircle,
  FolderCheck,
} from 'lucide-react';
import { UserProfile, MarkdownFile } from '../types';
import {
  requestGoogleDriveToken,
  fetchUserProfile,
  getOrCreateDriveFolder,
  listDriveFiles,
  saveFileToDrive,
  downloadDriveFileContent,
  DriveFileInfo,
} from '../utils/driveApi';
import { SyncConflictModal, ConflictData } from './SyncConflictModal';

interface GoogleDriveModalProps {
  clientId: string;
  userProfile: UserProfile | null;
  onUpdateUserProfile: (profile: UserProfile | null) => void;
  files: MarkdownFile[];
  onSyncFile: (fileId: string, driveFileId: string) => void;
  onImportDriveFile: (name: string, content: string, driveFileId: string) => void;
  onOverwriteLocalFile?: (fileId: string, content: string, driveFileId: string) => void;
  onBackupLocalFile?: (file: MarkdownFile) => void;
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: () => void;
  accentColor?: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  clientId,
  userProfile,
  onUpdateUserProfile,
  files,
  onSyncFile,
  onImportDriveFile,
  onOverwriteLocalFile,
  onBackupLocalFile,
  isDark,
  isOpen,
  onClose,
  autoSyncEnabled,
  onToggleAutoSync,
  accentColor = '#2563eb',
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [driveFileList, setDriveFileList] = useState<DriveFileInfo[]>([]);
  const [isLoadingDriveList, setIsLoadingDriveList] = useState(false);

  // Conflict Resolution State
  const [activeConflict, setActiveConflict] = useState<ConflictData | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!clientId) {
      setStatusMessage('관리자가 아직 Google 로그인을 설정하지 않았습니다.');
      return;
    }

    setIsConnecting(true);
    setStatusMessage('Google 계정 인증 진행 중...');

    requestGoogleDriveToken(
      clientId,
      async (accessToken) => {
        try {
          const profile = await fetchUserProfile(accessToken);
          onUpdateUserProfile({
            name: profile.name || 'Google 사용자',
            email: profile.email || '',
            picture: profile.picture,
            accessToken,
          });
          setStatusMessage('Google 계정이 연결되었습니다!');
          fetchDriveFiles(accessToken);
        } catch (err: any) {
          setStatusMessage(`프로필 가져오기 오류: ${err.message}`);
        } finally {
          setIsConnecting(false);
        }
      },
      (err) => {
        setStatusMessage(`연결 실패: ${err}`);
        setIsConnecting(false);
      }
    );
  };

  const fetchDriveFiles = async (token?: string) => {
    const accessToken = token || userProfile?.accessToken;
    if (!accessToken) return;

    try {
      setIsLoadingDriveList(true);
      const folderId = await getOrCreateDriveFolder(accessToken);
      const driveFiles = await listDriveFiles(accessToken, folderId);
      setDriveFileList(driveFiles);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingDriveList(false);
    }
  };

  const handleSyncAllToDrive = async () => {
    if (!userProfile?.accessToken) return;

    try {
      setIsSyncingAll(true);
      setStatusMessage('구글 드라이브로 파일 업로드 중...');

      const folderId = await getOrCreateDriveFolder(userProfile.accessToken);

      for (const file of files) {
        const result = await saveFileToDrive(
          userProfile.accessToken,
          folderId,
          file.name,
          file.content,
          file.driveFileId
        );
        onSyncFile(file.id, result.id);
      }

      setStatusMessage('모든 파일이 성공적으로 구글 드라이브에 동기화되었습니다!');
      fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage(`동기화 오류: ${err.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Download File from Drive with Conflict Detection
  const handleDownloadDriveFile = async (driveFile: DriveFileInfo) => {
    if (!userProfile?.accessToken) return;

    try {
      setStatusMessage(`"${driveFile.name}" 정보 확인 중...`);
      const cloudContent = await downloadDriveFileContent(userProfile.accessToken, driveFile.id);

      // Check if matching local file exists (by driveFileId or name)
      const matchingLocalFile = files.find(
        (f) =>
          f.driveFileId === driveFile.id ||
          f.name.toLowerCase() === driveFile.name.toLowerCase()
      );

      if (matchingLocalFile) {
        // If local content is different from cloud content, trigger conflict modal
        if (matchingLocalFile.content.trim() !== cloudContent.trim()) {
          setActiveConflict({
            localFile: matchingLocalFile,
            cloudFile: driveFile,
            cloudContent,
          });
          setStatusMessage(null);
          return;
        }
      }

      // No conflict or contents are identical
      onImportDriveFile(driveFile.name, cloudContent, driveFile.id);
      setStatusMessage(`"${driveFile.name}" 파일을 성공적으로 가져왔습니다.`);
    } catch (err: any) {
      setStatusMessage(`다운로드 오류: ${err.message}`);
    }
  };

  // Resolve Conflict Handler
  const handleResolveConflict = async (
    action: 'keep_local' | 'keep_cloud',
    createBackup: boolean
  ) => {
    if (!activeConflict || !userProfile?.accessToken) return;

    const { localFile, cloudFile, cloudContent } = activeConflict;

    try {
      // Step 1: Create local backup if checked
      if (createBackup && onBackupLocalFile) {
        onBackupLocalFile(localFile);
      }

      if (action === 'keep_local') {
        // Option 1: Keep Local -> Upload Local Content to Cloud Drive
        setStatusMessage(`로컬 버전으로 구글 드라이브 덮어쓰기 중...`);
        const folderId = await getOrCreateDriveFolder(userProfile.accessToken);
        const result = await saveFileToDrive(
          userProfile.accessToken,
          folderId,
          localFile.name,
          localFile.content,
          cloudFile.id
        );
        onSyncFile(localFile.id, result.id);
        setStatusMessage(`'${localFile.name}' 로컬 버전이 구글 드라이브에 성공적으로 적용되었습니다.`);
      } else {
        // Option 2: Keep Cloud -> Overwrite Local Content with Cloud Content
        setStatusMessage(`클라우드 버전으로 로컬 파일 덮어쓰기 중...`);
        const newContent = cloudContent || '';

        if (onOverwriteLocalFile) {
          onOverwriteLocalFile(localFile.id, newContent, cloudFile.id);
        } else {
          onImportDriveFile(cloudFile.name, newContent, cloudFile.id);
        }
        setStatusMessage(`'${cloudFile.name}' 클라우드 버전이 로컬에 적용되었습니다.`);
      }

      fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage(`충돌 해결 중 오류 발생: ${err.message}`);
    } finally {
      setActiveConflict(null);
    }
  };

  const handleDisconnect = () => {
    onUpdateUserProfile(null);
    setDriveFileList([]);
    setStatusMessage('Google 계정 연결이 해제되었습니다.');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
        <div
          className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[85vh] ${
            isDark
              ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-base">Google Drive 클라우드 동기화</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
            {/* Status Alert Banner */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{statusMessage}</span>
              </div>
            )}

            {/* Account Status */}
            {userProfile ? (
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {userProfile.picture ? (
                      <img
                        src={userProfile.picture}
                        alt={userProfile.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-emerald-400"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        {userProfile.name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="truncate max-w-[120px] sm:max-w-none">{userProfile.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-white font-medium shrink-0">
                          연결됨
                        </span>
                      </h3>
                      <p className="text-slate-500 text-[11px] truncate max-w-[150px] sm:max-w-none">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={onToggleAutoSync}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      파일 수정 시 자동 드라이브 동기화
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              /* Connect Form */
              <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-4 bg-slate-50/50 dark:bg-neutral-900/50">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Google 계정 동기화 연결
                  </h3>
                  <p className="text-slate-500 dark:text-neutral-400 text-xs leading-relaxed">
                    Google Drive와 연동하여 마크다운 문서를 안전하게 보관하고 실시간으로 자동 동기화할 수 있습니다.
                  </p>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span>Google 계정 원클릭 동기화 연결</span>
                </button>
              </div>
            )}

            {/* Actions Bar */}
            {userProfile && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FolderCheck className="w-4 h-4 text-emerald-500" />
                    <span>드라이브 동기화 및 동기화 작업</span>
                  </h3>

                  <button
                    onClick={() => fetchDriveFiles()}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    title="드라이브 파일목록 새로고침"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveList ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleSyncAllToDrive}
                    disabled={isSyncingAll}
                    className="py-2.5 px-3 rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50 text-xs shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>내 로컬 파일 전체 업로드</span>
                  </button>

                  <button
                    onClick={() => fetchDriveFiles()}
                    disabled={isLoadingDriveList}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>드라이브 목록 새로고침</span>
                  </button>
                </div>

                {/* Google Drive Folder Files */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    Google Drive "MarkdownEditor_Files" 폴더 목록 ({driveFileList.length}개)
                  </h4>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 p-2 bg-slate-50/50 dark:bg-neutral-900/50">
                    {driveFileList.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 italic">
                        드라이브에 저장된 파일이 없습니다.
                      </div>
                    ) : (
                      driveFileList.map((df) => (
                        <div
                          key={df.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <div className="truncate pr-2">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                              {df.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(df.modifiedTime).toLocaleString('ko-KR')}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDownloadDriveFile(df)}
                            className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shrink-0 shadow-xs"
                          >
                            가져오기
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Conflict Resolution Modal */}
      <SyncConflictModal
        isOpen={!!activeConflict}
        conflict={activeConflict}
        onResolve={handleResolveConflict}
        onCancel={() => setActiveConflict(null)}
        accentColor={accentColor}
        isDark={isDark}
      />
    </>
  );
};
