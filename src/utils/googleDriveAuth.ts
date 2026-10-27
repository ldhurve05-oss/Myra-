/**
 * Google Drive Authentication & Firebase Client Setup
 * Follows Google Workspace Integration and Firebase Guidelines:
 * - Client-side authentication via Firebase Auth and GoogleAuthProvider
 * - In-memory access token storage ONLY (NEVER saved to localStorage/sessionStorage)
 * - Automatic token expiration handling and graceful sign-out
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In-Memory Token Cache (strictly NEVER written to localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;
let tokenExpiryTimestamp: number = 0;

export const getDriveAccessToken = (): string | null => {
  if (!inMemoryAccessToken) return null;
  // If token has an expiry and has passed, clear it
  if (tokenExpiryTimestamp > 0 && Date.now() > tokenExpiryTimestamp) {
    inMemoryAccessToken = null;
    return null;
  }
  return inMemoryAccessToken;
};

export const setDriveAccessToken = (token: string | null, expiresInSeconds = 3600) => {
  inMemoryAccessToken = token;
  tokenExpiryTimestamp = token ? Date.now() + expiresInSeconds * 1000 : 0;
};

export const clearDriveAccessToken = () => {
  inMemoryAccessToken = null;
  tokenExpiryTimestamp = 0;
};

/**
 * Initiates Google OAuth popup with Google Drive scopes
 */
export async function signInWithGoogleDrive(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();

  // Add user-requested Google Drive scopes
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

  // Request offline access / prompt select_account if needed
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  const accessToken = credential?.accessToken;
  if (!accessToken) {
    throw new Error('Could not retrieve Google Drive access token from authentication result.');
  }

  // Store in memory
  setDriveAccessToken(accessToken, 3600);

  return {
    user: result.user,
    accessToken,
  };
}

/**
 * Sign out of Google Drive and clear in-memory credentials
 */
export async function signOutGoogleDrive(): Promise<void> {
  clearDriveAccessToken();
  await fbSignOut(auth);
}

/**
 * Subscribe to Auth State changes
 */
export function onDriveAuthChanged(callback: (user: User | null, token: string | null) => void) {
  return onAuthStateChanged(auth, user => {
    if (!user) {
      clearDriveAccessToken();
      callback(null, null);
    } else {
      callback(user, getDriveAccessToken());
    }
  });
}
