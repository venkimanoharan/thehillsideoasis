import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | undefined;

function buildCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    return cert(JSON.parse(serviceAccountJson));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    });
  }

  // Falls back to Application Default Credentials (Cloud Run's attached
  // service account, GOOGLE_APPLICATION_CREDENTIALS, or the emulator).
  return undefined;
}

function getFirebaseApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT;
  const credential = buildCredential();

  // Omit unset fields entirely rather than passing a guessed default — on
  // Cloud Run this lets the Admin SDK auto-discover both the credential and
  // the project ID from the attached service account via the metadata
  // server. A hardcoded fallback here would silently point at the wrong
  // project in any environment that didn't set these explicitly.
  const options: { credential?: ReturnType<typeof cert>; projectId?: string } = {};
  if (credential) options.credential = credential;
  if (projectId) options.projectId = projectId;

  return initializeApp(options);
}

export function getDb(): Firestore {
  if (!cachedApp) {
    cachedApp = getFirebaseApp();
  }

  // The Admin SDK targets the "(default)" database unless told otherwise.
  // Set this when the Firestore database was created with a custom database
  // ID (the GCP Console prompts for one; `gcloud firestore databases create`
  // without --database defaults to "(default)"). Leave unset locally against
  // the emulator, which only supports "(default)".
  const databaseId = process.env.FIRESTORE_DATABASE_ID;
  return databaseId ? getFirestore(cachedApp, databaseId) : getFirestore(cachedApp);
}

export const COLLECTIONS = {
  rooms: "rooms",
  activities: "activities",
  gallery: "gallery",
  siteSettings: "site_settings",
  bookings: "bookings",
  counters: "counters",
  loginAttempts: "login_attempts",
} as const;

export const SITE_SETTINGS_DOC_ID = "singleton";

/** Atomically allocates the next integer id for a named counter (e.g. "bookings"). */
export async function nextSequenceId(name: string): Promise<number> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.counters).doc(name);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.data()?.value as number | undefined) ?? 0;
    const next = current + 1;
    tx.set(ref, { value: next }, { merge: true });
    return next;
  });
}
