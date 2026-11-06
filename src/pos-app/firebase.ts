import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence } from 'firebase/firestore';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForPreviewModeOnly12345",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "fardouscomputer52.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "fardouscomputer52",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "fardouscomputer52.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err: any) => {
    if (err?.code === 'failed-precondition') {
      enableIndexedDbPersistence(db).catch(() => {});
    }
  });
}

export const googleProvider = new GoogleAuthProvider();
export const OperationType = {
  WRITE: 'WRITE',
  READ: 'READ',
  LIST: 'LIST',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

export const handleFirestoreError = (error: any, operationType?: string, path?: string) => {
  const code = error?.code || '';
  const message = error?.message || String(error);

  if (
    code === 'permission-denied' ||
    message.includes('permission-denied') ||
    message.includes('Missing or insufficient permissions')
  ) {
    console.warn(`[Firestore Permission Guard] Operation '${operationType || 'UNKNOWN'}' on '${path || 'unknown'}' denied:`, message);
    return;
  }
  console.error(`Firestore operation error [${operationType || 'UNKNOWN'} ${path || ''}]:`, error);
};


