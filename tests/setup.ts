// `firebase emulators:exec` sets FIRESTORE_EMULATOR_HOST itself; these
// fallbacks only kick in when running `vitest` directly against an emulator
// already started with `npm run emulators`.
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_PROJECT_ID ??= "demo-hillsideoasis";
process.env.PURGE_API_SECRET ??= "test-only-purge-secret";
