import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';

// Default config if the JSON file is missing or empty
const defaultConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  firestoreDatabaseId: ''
};

// @ts-ignore - Handle missing file on GitHub
import firebaseConfigJsonImport from '../../firebase-applet-config.json';
const firebaseConfigJson = firebaseConfigJsonImport || defaultConfig;

// Helper to check if a value is a placeholder or invalid
const isPlaceholder = (val: string | undefined) => {
  if (!val) return true;
  const placeholders = ['0147', '0148', 'TODO', 'YOUR_API_KEY', 'REPLACE_ME'];
  return placeholders.includes(val) || val.includes('INSERT_');
};

// Firebase configuration using Environment Variables (Vercel) with JSON fallback (AI Studio)
const firebaseConfig = {
  apiKey: !isPlaceholder(import.meta.env.VITE_FIREBASE_API_KEY) ? import.meta.env.VITE_FIREBASE_API_KEY : firebaseConfigJson.apiKey,
  authDomain: !isPlaceholder(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : firebaseConfigJson.authDomain,
  projectId: !isPlaceholder(import.meta.env.VITE_FIREBASE_PROJECT_ID) ? import.meta.env.VITE_FIREBASE_PROJECT_ID : firebaseConfigJson.projectId,
  storageBucket: !isPlaceholder(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : firebaseConfigJson.storageBucket,
  messagingSenderId: !isPlaceholder(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : firebaseConfigJson.messagingSenderId,
  appId: !isPlaceholder(import.meta.env.VITE_FIREBASE_APP_ID) ? import.meta.env.VITE_FIREBASE_APP_ID : firebaseConfigJson.appId,
  firestoreDatabaseId: !isPlaceholder(import.meta.env.VITE_FIREBASE_DATABASE_ID) ? import.meta.env.VITE_FIREBASE_DATABASE_ID : firebaseConfigJson.firestoreDatabaseId
};

// Validate that we have the required config
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. If you are in production, set VITE_FIREBASE_API_KEY in your environment variables.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
