// Seeds Firestore from the data/*.json fixtures.
//
// Local (emulator):
//   firebase emulators:start --only firestore
//   FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-hillsideoasis node scripts/seed-firestore.mjs
//
// Production: run with a service account that has Firestore write access, e.g.
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json FIREBASE_PROJECT_ID=<project> node scripts/seed-firestore.mjs
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
// Set FIRESTORE_DATABASE_ID if the database was created with a custom ID
// instead of "(default)" (the GCP Console prompts for one).
const databaseId = process.env.FIRESTORE_DATABASE_ID;
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

async function readJson(fileName) {
  const filePath = path.join(process.cwd(), "data", fileName);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function seedCollection(collectionName, items) {
  const batch = db.batch();
  let maxId = 0;

  for (const item of items) {
    const ref = db.collection(collectionName).doc(String(item.id));
    batch.set(ref, item);
    maxId = Math.max(maxId, item.id);
  }

  await batch.commit();
  await db.collection("counters").doc(collectionName).set({ value: maxId }, { merge: true });
  console.log(`Seeded ${items.length} ${collectionName} document(s), counter set to ${maxId}.`);
}

async function seedSiteSettings() {
  const settings = await readJson("site-settings.json");
  await db.collection("site_settings").doc("singleton").set(settings, { merge: true });
  console.log("Seeded site_settings/singleton.");
}

async function seedBookingsCounter() {
  let bookings = [];
  try {
    bookings = await readJson("bookings.json");
  } catch {
    bookings = [];
  }
  const maxId = bookings.reduce((max, b) => Math.max(max, b.id ?? 0), 0);
  await db.collection("counters").doc("bookings").set({ value: maxId }, { merge: true });
  console.log(`Bookings counter initialized to ${maxId}.`);
}

async function main() {
  const [rooms, activities, gallery, journalPosts] = await Promise.all([
    readJson("rooms.json"),
    readJson("activities.json"),
    readJson("gallery.json"),
    readJson("journal-posts.json"),
  ]);

  await seedCollection("rooms", rooms);
  await seedCollection("activities", activities);
  await seedCollection("gallery", gallery);
  await seedCollection("journal_posts", journalPosts);
  await seedSiteSettings();
  await seedBookingsCounter();

  console.log("Firestore seed complete.");
}

main().catch((error) => {
  console.error("Firestore seed failed:", error);
  process.exitCode = 1;
});
