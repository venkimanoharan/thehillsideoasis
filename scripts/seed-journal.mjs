// Seeds ONLY the journal_posts collection from data/journal-posts.json.
// Safe to run against production without touching rooms/activities/gallery —
// unlike seed-firestore.mjs, this won't overwrite any admin-made edits to
// other collections.
//
// Local (emulator):
//   FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-hillsideoasis node scripts/seed-journal.mjs
//
// Production: run with a service account that has Firestore write access, e.g.
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json FIREBASE_PROJECT_ID=<project> node scripts/seed-journal.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) {
  console.error("Set FIREBASE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) before running this script.");
  process.exit(1);
}
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const app = initializeApp(
  serviceAccountJson ? { credential: cert(JSON.parse(serviceAccountJson)), projectId } : { projectId },
);
const databaseId = process.env.FIRESTORE_DATABASE_ID;
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

async function main() {
  const filePath = path.join(process.cwd(), "data", "journal-posts.json");
  const posts = JSON.parse(await readFile(filePath, "utf-8"));

  const batch = db.batch();
  let maxId = 0;

  for (const post of posts) {
    const ref = db.collection("journal_posts").doc(String(post.id));
    batch.set(ref, post, { merge: true });
    maxId = Math.max(maxId, post.id);
  }

  await batch.commit();
  await db.collection("counters").doc("journal_posts").set({ value: maxId }, { merge: true });
  console.log(`Seeded ${posts.length} journal_posts document(s), counter set to ${maxId}.`);
}

main().catch((error) => {
  console.error("Journal seed failed:", error);
  process.exitCode = 1;
});
