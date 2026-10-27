/**
 * Google Drive REST API v3 Service
 * Handles listing, searching, uploading text/docs, starring, and deleting files.
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  starred?: boolean;
  trashed?: boolean;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
}

export interface ListFilesOptions {
  query?: string;
  pageSize?: number;
  pageToken?: string;
  typeFilter?: 'all' | 'docs' | 'sheets' | 'slides' | 'pdf' | 'images' | 'text';
  folderId?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Fetch files from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  options: ListFilesOptions = {}
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const { query, pageSize = 25, pageToken, typeFilter = 'all' } = options;

  const queryParts: string[] = ['trashed = false'];

  if (query && query.trim()) {
    const escaped = query.replace(/'/g, "\\'");
    queryParts.push(`name contains '${escaped}'`);
  }

  // Type filter queries
  switch (typeFilter) {
    case 'docs':
      queryParts.push("mimeType = 'application/vnd.google-apps.document'");
      break;
    case 'sheets':
      queryParts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
      break;
    case 'slides':
      queryParts.push("mimeType = 'application/vnd.google-apps.presentation'");
      break;
    case 'pdf':
      queryParts.push("mimeType = 'application/pdf'");
      break;
    case 'images':
      queryParts.push("mimeType contains 'image/'");
      break;
    case 'text':
      queryParts.push("(mimeType contains 'text/' or mimeType = 'application/json')");
      break;
    default:
      break;
  }

  const q = queryParts.join(' and ');
  const fields = 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, starred, trashed, owners)';

  const url = new URL(`${DRIVE_API_BASE}/files`);
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('fields', fields);
  url.searchParams.set('orderBy', 'modifiedTime desc');
  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED_EXPIRED_TOKEN');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch files from Google Drive (${res.status})`);
  }

  const data = await res.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Upload text/markdown/json content to Google Drive (e.g. Chat history, note, transcript)
 */
export async function uploadTextToDrive(
  accessToken: string,
  params: {
    filename: string;
    content: string;
    mimeType?: string;
    description?: string;
  }
): Promise<DriveFile> {
  const { filename, content, mimeType = 'text/plain', description = 'Created by Myra AI Assistant' } = params;

  const metadata = {
    name: filename,
    mimeType,
    description,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED_EXPIRED_TOKEN');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to upload file to Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Star or unstar a file
 */
export async function toggleStarDriveFile(
  accessToken: string,
  fileId: string,
  starred: boolean
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ starred }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED_EXPIRED_TOKEN');
    throw new Error('Failed to update starred status');
  }
}

/**
 * Permanently delete a file from Google Drive
 * NOTE: UI must show explicit user confirmation modal before calling this!
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED_EXPIRED_TOKEN');
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to delete file from Google Drive');
  }
}

/**
 * Format bytes to readable string (KB, MB, GB)
 */
export function formatDriveFileSize(bytesStr?: string): string {
  if (!bytesStr) return '—';
  const bytes = parseInt(bytesStr, 10);
  if (isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get human friendly type descriptor and color badge
 */
export function getDriveFileTypeInfo(mimeType: string) {
  if (mimeType.includes('google-apps.document')) {
    return { label: 'Google Doc', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
  if (mimeType.includes('google-apps.spreadsheet')) {
    return { label: 'Google Sheet', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  }
  if (mimeType.includes('google-apps.presentation')) {
    return { label: 'Google Slide', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }
  if (mimeType.includes('pdf')) {
    return { label: 'PDF Document', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
  if (mimeType.includes('image/')) {
    return { label: 'Image', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  }
  if (mimeType.includes('video/')) {
    return { label: 'Video', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' };
  }
  if (mimeType.includes('audio/')) {
    return { label: 'Audio', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
  }
  if (mimeType.includes('folder')) {
    return { label: 'Folder', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  }
  return { label: 'Text/File', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
}
