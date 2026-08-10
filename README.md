# The HillSide Oasis (Next.js)

Website and booking platform for The HillSide Oasis, built on Next.js App Router, TypeScript, Tailwind CSS, and Firestore.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- Firestore (Native mode) for all content and bookings — no local files or SQL database in production
- Firebase Admin SDK on the server only; no client-side Firestore access
- bcrypt-hashed admin credentials, HMAC-signed sessions, Firestore-backed login rate limiting
- Nonce-based Content-Security-Policy and standard security headers via `src/middleware.ts`
- GitHub Actions: PR/main verification (lint/typecheck/build/audit) + CodeQL + Dependabot
- Deploys via a Cloud Build trigger configured in the GCP Console (Cloud Run's native GitHub integration) — builds and deploys automatically on every push to `main`, independent of GitHub Actions

## Routes

- `/` -> landing page
- `/about`, `/stay`, `/activities`, `/gallery`, `/contact` -> content pages (Firestore-backed)
- `/booking` -> interactive booking calendar and reservation form
- `/admin/login` -> admin login
- `/admin` -> admin dashboard (rooms, activities, gallery, bookings, settings)
- `/api/booking` -> creates a booking inside a Firestore transaction (atomic conflict check + write; price computed server-side)
- `/api/availability` -> unavailable dates for a room, from Firestore bookings
- `/api/admin/*` -> authenticated CRUD + booking status management + availability blocking

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Start the Firestore emulator (no GCP project needed)

```bash
npm run emulators
```

This starts the Firestore emulator on `127.0.0.1:8080` (UI at `http://127.0.0.1:4000`).

### 3) Seed the emulator with starter content

In a second terminal:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-hillsideoasis npm run seed:firestore
```

### 4) Run the app

```bash
cp .env.example .env.local
```

Add to `.env.local`:

```
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_PROJECT_ID=demo-hillsideoasis
```

```bash
npm run dev
```

Open `http://localhost:3000`. Admin login at `http://localhost:3000/admin/login` uses `admin` / `change-me` when `ADMIN_PASSWORD_HASH` isn't set (dev only — this fallback is disabled entirely when `NODE_ENV=production`).

## Environment Variables

See `.env.example` for the full list. Required in production:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` — bcrypt hash, generate with `node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"`
- `ADMIN_SESSION_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

If any of these three are missing in production, the login route refuses all logins (fails closed) instead of falling back to defaults.

Firestore credentials are **not** set as environment variables in production — the Cloud Run service uses a dedicated service account (see step 2 below) and the Admin SDK picks it up automatically via Application Default Credentials.

One more that's easy to miss: if your Firestore database was created with a custom **Database ID** instead of `(default)` — the GCP Console's "Create Database" flow prompts for one and doesn't default to `(default)`, unlike `gcloud firestore databases create` — set `FIRESTORE_DATABASE_ID` to that value. Without it, every Firestore call fails with `NOT_FOUND` even though the project ID and credentials are correct. (This is a real production incident we hit and fixed — see git history around the `FIRESTORE_DATABASE_ID` addition if you want the full story.)

## Tests

Regression coverage for `/api/booking` — this endpoint has broken in production three separate times (undefined request fields, wrong Firestore project, wrong Firestore database ID), always in ways mocked-Firestore unit tests wouldn't have caught. The tests run against a real Firestore emulator instance instead:

```bash
npm test
```

This spins up a throwaway Firestore emulator via `firebase emulators:exec`, runs the Vitest suite in `tests/`, and tears the emulator down afterward — no manual setup needed. It also runs in CI (`.github/workflows/deploy.yml`).

If you already have `npm run emulators` running in another terminal, you can run the suite directly against it instead:

```bash
npm run test:watch
```

## Production Build

```bash
npm run build
npm run start
```

## Deploy to GCP (Cloud Run + Firestore)

### 1) One-time GCP project setup

```bash
PROJECT_ID=your-gcp-project-id
REGION=us-central1

gcloud config set project "$PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  iamcredentials.googleapis.com

# Firestore database (Native mode) — one per project
gcloud firestore databases create --location="$REGION" --type=firestore-native

# Artifact Registry repo for the container image
gcloud artifacts repositories create thehillsideoasis-web \
  --repository-format=docker \
  --location="$REGION" \
  --description="Docker repository for The HillSide Oasis"
```

### 2) Create the Cloud Run runtime service account

This is the identity Cloud Run uses to talk to Firestore — no credentials are stored in env vars.

```bash
gcloud iam service-accounts create thehillsideoasis-run \
  --display-name="The HillSide Oasis Cloud Run runtime"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:thehillsideoasis-run@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

### 3) Store admin secrets in Secret Manager

```bash
printf '%s' "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" \
  | gcloud secrets create admin-session-secret --data-file=-

printf '%s' "$(node -e "console.log(require('bcryptjs').hashSync('REPLACE_WITH_A_STRONG_PASSWORD', 10))")" \
  | gcloud secrets create admin-password-hash --data-file=-

gcloud secrets add-iam-policy-binding admin-session-secret \
  --member="serviceAccount:thehillsideoasis-run@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding admin-password-hash \
  --member="serviceAccount:thehillsideoasis-run@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4) Set up continuous deployment via Cloud Build

This is the path actually in use for this project — Cloud Run's native GitHub integration, configured once in the Console rather than via `gcloud`:

1. Cloud Run → select (or create) the `thehillsideoasis-web` service → **Set up Continuous Deployment**.
2. Connect the GitHub repository (one-time GitHub App authorization).
3. Build configuration: **Branch** `^main$`, **Build Type** Dockerfile, **Source location** `/Dockerfile` (the repo root Dockerfile).
4. Save. Every push to `main` now triggers a Cloud Build build and Cloud Run deploy automatically — no service account keys or GitHub secrets involved, since Cloud Build authenticates via its own GCP-side connection.

After the trigger is created, set the runtime configuration on the Cloud Run service itself (Edit & Deploy New Revision):

- **Security** tab → service account → `thehillsideoasis-run@${PROJECT_ID}.iam.gserviceaccount.com` (created in step 2)
- **Variables & Secrets** tab → add `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (or reference the Secret Manager secret from step 3), `ADMIN_SESSION_SECRET` (ditto), and `FIRESTORE_DATABASE_ID` if your Firestore database uses a custom database ID (see the Environment Variables section above)

Deploy that revision once to apply the settings; the Cloud Build trigger keeps it current on every subsequent push.

*(A GitHub Actions-based deploy path using Workload Identity Federation is also possible if you'd rather not depend on Console configuration, but isn't what's wired up today — `.github/workflows/deploy.yml` only runs verification, not deployment.)*

### 5) Seed production Firestore

```bash
gcloud iam service-accounts keys create /tmp/seed-key.json \
  --iam-account="thehillsideoasis-run@${PROJECT_ID}.iam.gserviceaccount.com"

GOOGLE_APPLICATION_CREDENTIALS=/tmp/seed-key.json FIREBASE_PROJECT_ID="$PROJECT_ID" npm run seed:firestore

rm /tmp/seed-key.json
```

(Prefer running the seed script from Cloud Shell or a short-lived key you delete immediately — avoid long-lived keys on your laptop.)

### Firestore security rules

`firestore.rules` denies all client access — every read/write goes through the Next.js server via the Admin SDK, which bypasses rules entirely. Deploy rules with:

```bash
npx firebase deploy --only firestore:rules --project "$PROJECT_ID"
```

## CI/CD

- **Pull requests and pushes to `main`** (`.github/workflows/deploy.yml`): lint, typecheck, build, booking API regression tests (against the Firestore emulator), and a dependency audit. This is verification only — it does not deploy.
- **Deployment**: a Cloud Build trigger configured in the Console (Cloud Run → `thehillsideoasis-web` → Triggers) watches `main` and builds/deploys on every push, independent of GitHub Actions. See "Deploy to GCP" above.
- **CodeQL** (`.github/workflows/codeql.yml`): security scanning on push/PR and weekly.
- **Dependabot** (`.github/dependabot.yml`): weekly updates for npm, GitHub Actions, and the Dockerfile base image.

## Open-Source Media Credits

The redesigned visual experience uses open-license media from Pexels (free to use under the Pexels License).

- Hero video (Western Ghats waterfall): https://www.pexels.com/video/athirappilly-water-falls-4488285/
- Hero and section photos (Western Ghats region):
- https://www.pexels.com/photo/scenic-view-of-a-mountain-12311221/
- https://www.pexels.com/photo/scenic-road-through-wayanad-s-lush-tea-estates-34130875/
- https://www.pexels.com/photo/lush-green-paddy-fields-in-palakkad-kerala-28901908/
- https://www.pexels.com/photo/green-mountain-peak-against-blue-sky-6144912/
- https://www.pexels.com/photo/landscape-of-a-mountain-valley-18827152/
- https://www.pexels.com/photo/green-mountain-under-cloudy-sky-1786306/

Reference design inspiration (structure and feel only, no direct copy):

- https://www.lakewayresortandspa.com
