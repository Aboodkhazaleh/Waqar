/**
 * Firebase Admin SDK — SERVER-ONLY initialization.
 *
 * This file MUST NEVER be imported from a client component, hook, or any
 * file that is bundled for the browser. The Admin SDK uses service-account
 * credentials and bypasses Firestore Security Rules — exposing it to a
 * browser would be a critical security incident.
 *
 * All API routes (under /src/app/api/...) and Server Components that need
 * to read or write Firestore / Cloud Storage MUST go through here instead
 * of the client SDK in src/firebase.ts.
 *
 * Credentials are read from environment variables. Two formats supported:
 *
 *   1. Single JSON blob (preferred for Vercel):
 *        FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"…",…}'
 *
 *   2. Three split vars (preferred for local dev):
 *        FIREBASE_PROJECT_ID=waqar1-2fc58
 *        FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@waqar1-2fc58.iam.gserviceaccount.com
 *        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
 *
 * Generate credentials at:
 *   Firebase Console → Project Settings → Service accounts → Generate new private key
 */

import "server-only"; // Build-time guard: errors if accidentally imported in a client bundle
import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let cachedApp: App | null = null;

/** Lazily-initialized Admin SDK app instance. Errors clearly when env vars are missing. */
function ensureAdminApp(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  let projectId: string | undefined;
  let clientEmail: string | undefined;
  let privateKey: string | undefined;

  // Prefer the JSON blob — single source of truth, easier to rotate
  const blob = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (blob) {
    try {
      const parsed = JSON.parse(blob);
      projectId = parsed.project_id;
      clientEmail = parsed.client_email;
      privateKey = parsed.private_key;
    } catch (err) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON. " +
          "Paste the entire downloaded service-account JSON as a single line. " +
          (err instanceof Error ? err.message : "")
      );
    }
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = process.env.FIREBASE_PRIVATE_KEY;
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK is not configured. " +
        "Set FIREBASE_SERVICE_ACCOUNT (json) OR all three of " +
        "FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY. " +
        "Get them from Firebase Console → Project Settings → Service accounts."
    );
  }

  // The private key from Vercel/.env files often arrives with literal "\n" — fix it
  privateKey = privateKey.replace(/\\n/g, "\n");

  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${projectId}.firebasestorage.app`,
  });

  return cachedApp;
}

/** Server-side Firestore. Bypasses Security Rules — use only in trusted code paths. */
export function adminDb(): Firestore {
  return getFirestore(ensureAdminApp());
}

/** Server-side Storage bucket. Bypasses Storage Rules — use only in trusted code paths. */
export function adminBucket() {
  return getStorage(ensureAdminApp()).bucket();
}

/** Reports whether the Admin SDK env vars are present (does not actually init). */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
      (process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY)
  );
}
