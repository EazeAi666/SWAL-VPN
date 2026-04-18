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

// Helper to check if a value is a placeholder or invalid
const isPlaceholder = (val: string | undefined) => {
  if (!val) return true;
  const placeholders = ['0147', '0148', 'TODO', 'YOUR_API_KEY', 'REPLACE_ME'];
  return placeholders.includes(val) || val.includes('INSERT_');
};

// Start with environment variables - defaulting to null for invalid check
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID
};

const firebaseConfig: any = { ...envConfig };

// Attempt to load from JSON
try {
  // @ts-ignore
  const globConfig = import.meta.glob('../../firebase-applet-config.json', { eager: true, import: 'default' });
  const jsonConfig: any = Object.values(globConfig)[0];
  
  if (jsonConfig) {
    Object.keys(jsonConfig).forEach(key => {
      if (isPlaceholder(firebaseConfig[key])) {
        firebaseConfig[key] = jsonConfig[key];
      }
    });
  }
} catch (e) {
  // Config file might be missing
}

// Final fallback to empty strings for initialization
['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'firestoreDatabaseId'].forEach(key => {
  if (!firebaseConfig[key]) firebaseConfig[key] = '';
});

// Validate that we have the required keys
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === '') {
  console.warn("Firebase API Key is missing. Login will not work.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// CRITICAL: Ensure database ID is correctly passed if it exists
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
