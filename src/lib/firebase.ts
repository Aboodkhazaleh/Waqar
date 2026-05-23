/**
 * Re-export shim — canonical Firebase init lives at `src/firebase.ts`.
 * Existing imports from `@/lib/firebase` continue to work via this file.
 */
export {
  firebaseApp,
  db,
  firebaseStorage,
  isFirebaseConfigured,
  getAnalyticsClient,
  COLLECTIONS,
  SETTINGS_DOC_ID,
} from "@/firebase";
