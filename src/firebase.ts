/**
 * Firebase initialization — canonical entry point.
 *
 * Exports:
 *  - firebaseApp  : the FirebaseApp instance
 *  - db           : Firestore client
 *  - firebaseStorage : Firebase Storage client (uploads)
 *  - analytics    : Firebase Analytics (browser-only, lazy)
 *  - isFirebaseConfigured : boolean
 *  - COLLECTIONS, SETTINGS_DOC_ID : naming constants
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Pull from env vars first; fall back to inline values so the app works
// even if .env.local is missing (e.g. quick clones).
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAZFfD-rdqs1bBEVHQtAYBiI84x7kk9nfg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "waqar1-2fc58.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "waqar1-2fc58",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "waqar1-2fc58.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "49781238651",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:49781238651:web:6018f421509de5ca2aebde",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-W846BYTLWR",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

// Singleton — avoid double-init under HMR / SSR
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(firebaseApp);
export const firebaseStorage: FirebaseStorage = getStorage(firebaseApp);

// Analytics is browser-only and depends on async support check.
// We initialize it lazily so SSR doesn't crash.
let analyticsInstance: import("firebase/analytics").Analytics | null = null;

export async function getAnalyticsClient() {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return null;
  analyticsInstance = getAnalytics(firebaseApp);
  return analyticsInstance;
}

// Trigger analytics init in the browser without blocking SSR
if (typeof window !== "undefined") {
  getAnalyticsClient().catch(() => {/* analytics is optional */});
}

// Firestore collection/doc names — single source of truth
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  SETTINGS: "settings",
} as const;

export const SETTINGS_DOC_ID = "global";
