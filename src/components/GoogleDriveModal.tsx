import React, { useState, useEffect, useCallback } from 'react';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  getDriveAccessToken,
  clearDriveAccessToken,
  auth,
} from '../utils/googleDriveAuth';
import {
  DriveFile,
  listDriveFiles,
  uploadTextToDrive,
  toggleStarDriveFile,
  deleteDriveFile,
  formatDriveFileSize,
  getDriveFileTypeInfo,
} from '../utils/googleDriveService';
import { sounds } from '../utils/audio';
import {
  Folder,
  FileText,
  Search,
  RefreshCw,
  Upload,
  Trash2,
  Star,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  FilePlus,
  HardDrive,
  LogOut,
  Sparkles,
  FileSpreadsheet,
  Presentation,
  FileCheck,
  Lock,
  Layers,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerHaptic?: (pattern?: number | number[]) => void;
  chatMessagesToExport?: Array<{ role: string; text: string; timestamp: string }>;
  isGfMode?: boolean;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  triggerHaptic = () => {},
  chatMessagesToExport = [],
  isGfMode = false,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(getDriveAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'docs' | 'sheets' | 'slides' | 'pdf' | 'images' | 'text'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Destructive delete confirmation modal state (CRITICAL)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Upload Note Modal
  const [showUploadNoteModal, setShowUploadNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Load files when accessToken is ready or filters change
  const fetchFiles = useCallback(async (token: string, search = searchQuery, filter = typeFilter) => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const res = await listDriveFiles(token, {
        query: search,
        typeFilter: filter,
        pageSize: 30,
      });
      setFiles(res.files);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_EXPIRED_TOKEN') {
        clearDriveAccessToken();
        setAccessToken(null);
        setErrorMessage('Your Google Drive session has expired. Please sign in again.');
      } else {
        setErrorMessage(err?.message || 'Could not load Google Drive files.');
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [searchQuery, typeFilter]);

  // Auth check & load files on open
  useEffect(() => {
    if (!isOpen) return;

    const token = getDriveAccessToken();
    setAccessToken(token);
    setCurrentUser(auth.currentUser);

    if (token) {
      fetchFiles(token);
    }
  }, [isOpen, fetchFiles]);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    triggerHaptic(50);
    sounds.playCutePop();
    try {
      const result = await signInWithGoogleDrive();
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      sounds.playSuccess();
      showToast('Google Drive connected successfully!');
      fetchFiles(result.accessToken);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google Drive.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Google Sign Out
  const handleSignOut = async () => {
    triggerHaptic(50);
    sounds.playCutePop();
    try {
      await signOutGoogleDrive();
      setCurrentUser(null);
      setAccessToken(null);
      setFiles([]);
      showToast('Signed out of Google Drive');
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  // Star / Unstar
  const handleToggleStar = async (file: DriveFile) => {
    if (!accessToken) return;
    triggerHaptic(40);
    const newStarred = !file.starred;
    try {
      // Optimistic update
      setFiles(prev =>
        prev.map(f => (f.id === file.id ? { ...f, starred: newStarred } : f))
      );
      await toggleStarDriveFile(accessToken, file.id, newStarred);
      sounds.playCutePop();
    } catch (err: any) {
      // Revert on error
      setFiles(prev =>
        prev.map(f => (f.id === file.id ? { ...f, starred: file.starred } : f))
      );
      showToast('Could not update starred state.');
    }
  };

  // Execute Destructive Delete (AFTER user confirms in UI)
  const handleConfirmDelete = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    triggerHaptic([60, 60]);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      sounds.playCutePop();
      showToast(`Deleted "${fileToDelete.name}"`);
      setFileToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Could not delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick export current chat conversation to Drive
  const handleExportChatToDrive = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    if (chatMessagesToExport.length === 0) {
      showToast('No chat conversation messages to export yet.');
      return;
    }

    setIsUploading(true);
    triggerHaptic(60);
    sounds.playListenStart();

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Myra_Chat_History_${timestampStr}.txt`;

    const divider = '================================================================================';
    const header = `${divider}
MYRA PERSONAL AI ASSISTANT - GOOGLE DRIVE CHAT BACKUP
${divider}
Date Exported: ${new Date().toLocaleString()}
Assistant Mode: ${isGfMode ? 'Girlfriend Mode 💕' : 'Personal Assistant'}
Messages Count: ${chatMessagesToExport.length}
${divider}\n\n`;

    const body = chatMessagesToExport
      .map(
        m =>
          `[${m.timestamp}] ${m.role === 'user' ? 'YOU' : 'MYRA'}:\n${m.text}\n`
      )
      .join('\n--------------------------------------------------------------------------------\n');

    try {
      const uploaded = await uploadTextToDrive(accessToken, {
        filename,
        content: header + body,
        mimeType: 'text/plain',
        description: 'Auto-saved Myra conversation log',
      });
      sounds.playSuccess();
      showToast(`Successfully saved "${uploaded.name}" to Google Drive!`);
      // Add to file list
      setFiles(prev => [uploaded, ...prev]);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save chat to Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Create custom note in Drive
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !noteTitle.trim()) return;

    setIsUploading(true);
    triggerHaptic(50);

    const filename = noteTitle.endsWith('.txt') ? noteTitle : `${noteTitle}.txt`;

    try {
      const uploaded = await uploadTextToDrive(accessToken, {
        filename,
        content: noteContent || 'Created with Myra AI Assistant',
        mimeType: 'text/plain',
        description: 'Created by Myra AI Assistant',
      });
      sounds.playSuccess();
      showToast(`Created "${uploaded.name}" in Google Drive!`);
      setFiles(prev => [uploaded, ...prev]);
      setShowUploadNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Google Drive Manager
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  Workspace Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse files, search Drive, save chat transcripts & notes
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(40);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast */}
        {statusNotification && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 flex items-center gap-2 text-xs text-emerald-300 animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{statusNotification}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Sign In State / User Profile Card */}
          {!accessToken ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center">
                <Folder className="w-7 h-7 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sign in with your Google Account to search your files, open Google Docs and Sheets, and backup Myra conversation transcripts directly to your Drive.
                </p>
              </div>

              {authError && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 flex items-center gap-2 max-w-md mx-auto text-left">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official Google Sign-In Button */}
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isAuthenticating ? 'Connecting to Drive...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> Client-side Secure
                </span>
                <span>•</span>
                <span>Token in-memory only</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected User Bar */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-9 h-9 rounded-full border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      {currentUser?.displayName ? currentUser.displayName[0] : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {currentUser?.displayName || 'Google Account'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                        Connected
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {currentUser?.email || 'Authenticated for Google Drive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportChatToDrive}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Export Myra chat history to Google Drive"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Saving...' : 'Save Chat to Drive'}</span>
                  </button>

                  <button
                    onClick={() => setShowUploadNoteModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>New Note</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Google Drive files..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && accessToken) {
                          fetchFiles(accessToken, searchQuery, typeFilter);
                        }
                      }}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          if (accessToken) fetchFiles(accessToken, '', typeFilter);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (accessToken) {
                        triggerHaptic(40);
                        fetchFiles(accessToken, searchQuery, typeFilter);
                      }
                    }}
                    disabled={isLoadingFiles}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Refresh Files"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-blue-400' : ''}`} />
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {(
                    [
                      { id: 'all', label: 'All Files' },
                      { id: 'docs', label: 'Docs' },
                      { id: 'sheets', label: 'Sheets' },
                      { id: 'slides', label: 'Slides' },
                      { id: 'pdf', label: 'PDFs' },
                      { id: 'images', label: 'Images' },
                      { id: 'text', label: 'Text/Notes' },
                    ] as const
                  ).map(pill => (
                    <button
                      key={pill.id}
                      onClick={() => {
                        setTypeFilter(pill.id);
                        if (accessToken) fetchFiles(accessToken, searchQuery, pill.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                        typeFilter === pill.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={handleSignIn}
                    className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-medium"
                  >
                    Re-authenticate
                  </button>
                </div>
              )}

              {/* Files Grid / List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Recent Google Drive Files</span>
                  <span>{files.length} items loaded</span>
                </div>

                {isLoadingFiles ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <span className="text-xs text-slate-400">Loading files from Google Drive...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2">
                    <Folder className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No matching files found in your Google Drive.</p>
                    <button
                      onClick={handleExportChatToDrive}
                      className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" /> Save current chat history now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map(file => {
                      const typeInfo = getDriveFileTypeInfo(file.mimeType);
                      const formattedDate = new Date(file.modifiedTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <div
                          key={file.id}
                          className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              {file.mimeType.includes('document') ? (
                                <FileText className="w-4 h-4 text-blue-400" />
                              ) : file.mimeType.includes('spreadsheet') ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                              ) : file.mimeType.includes('presentation') ? (
                                <Presentation className="w-4 h-4 text-amber-400" />
                              ) : file.mimeType.includes('folder') ? (
                                <Folder className="w-4 h-4 text-yellow-400" />
                              ) : (
                                <FileCheck className="w-4 h-4 text-cyan-400" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                                  {file.name}
                                </h4>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span>{formattedDate}</span>
                                <span>•</span>
                                <span>{formatDriveFileSize(file.size)}</span>
                                {file.owners?.[0] && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[120px]">
                                      {file.owners[0].displayName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Star Toggle */}
                            <button
                              onClick={() => handleToggleStar(file)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                file.starred
                                  ? 'text-amber-400 hover:bg-amber-400/20'
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                              }`}
                              title={file.starred ? 'Starred' : 'Add Star'}
                            >
                              <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400' : ''}`} />
                            </button>

                            {/* Open in Google Drive */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Delete File (Triggers Mandatory Confirmation Modal) */}
                            <button
                              onClick={() => {
                                triggerHaptic(50);
                                setFileToDelete(file);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Voice command: Say "Google Drive kholo" to open anytime</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* MANDATORY EXPLICIT CONFIRMATION MODAL FOR DESTRUCTIVE ACTION (DELETE) */}
        {fileToDelete && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white">Delete Google Drive File?</h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to delete <span className="font-semibold text-rose-300">"{fileToDelete.name}"</span>?
                </p>
                <p className="text-[11px] text-slate-500">
                  This file will be permanently removed from your Google Drive. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setFileToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Note Modal */}
        {showUploadNoteModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-25 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FilePlus className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">New Google Drive Note</h3>
                </div>
                <button
                  onClick={() => setShowUploadNoteModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Myra_Meeting_Notes"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Content</label>
                  <textarea
                    rows={4}
                    placeholder="Write your note or thoughts here..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadNoteModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !noteTitle.trim()}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Save to Drive'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
