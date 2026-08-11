export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
  driveFileId?: string;
  lastSyncedAt?: number;
  syncStatus?: 'synced' | 'modified' | 'syncing' | 'error' | 'local_only';
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export interface PreviewStyleConfig {
  boldColor: string;
  boldBgColor: string;
  linkColor?: string;
  headingColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  codeTheme: 'github-dark' | 'github-light' | 'atom-one-dark' | 'dracula' | 'vs' | 'night-owl';
  fontSize: 'sm' | 'base' | 'lg';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  enableBoldColor?: boolean;
  accentHeadings?: boolean;
  accentTable?: boolean;
  accentHr?: boolean;
}

export type ViewMode = 'split' | 'editor' | 'preview';
export type AppTheme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}
