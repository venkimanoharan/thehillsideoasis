# The HillSide Oasis (Next.js)

Modernized website migration for The HillSide Oasis using Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- PostgreSQL (Docker)
- Adminer (Docker)

## Routes

- `/` -> migrated landing page
- `/about` -> about page (DB-backed)
- `/stay` -> migrated stay/accommodation page
- `/activities` -> activities page (DB-backed)
- `/gallery` -> gallery page (DB-backed)
- `/contact` -> contact page
- `/booking` -> interactive booking page
- `/admin/login` -> admin login
- `/admin` -> admin dashboard for content maintenance
- `/api/booking` -> server-side booking endpoint with trace IDs
- `/api/availability` -> unavailable dates for a room from DB bookings
- `/api/admin/bookings` -> booking status management and availability blocking

## Local URLs

- Website: `http://localhost:3000`
- Booking page: `http://localhost:3000/booking`
- Admin login: `http://localhost:3000/admin/login`
- Admin dashboard: `http://localhost:3000/admin`
- Adminer: `http://localhost:8081`

## Production URLs

- Website: `https://thehillsideoasis.com`
- Stay: `https://thehillsideoasis.com/stay`
- Booking: `https://thehillsideoasis.com/booking`

## Development

```bash
npm install
npm run dev
```

## Local Database (Docker)

Start PostgreSQL + Adminer:

```bash
docker compose up -d
```

This project mounts `docker/postgres/init/001-init.sql` into the Postgres init directory.
On first container creation, it will create tables and seed initial content.

Adminer is available at `http://localhost:8081`.

Default DB service values:

- Host: `localhost`
- Port: `5433`
- Database: `hillsideoasis`
- Username: `hillsideoasis`
- Password: `hillsideoasis`

Then run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Booking Flow

Client form (`/booking`) submits to internal API route (`/api/booking`) which writes directly to PostgreSQL `bookings`.

Availability is fully database-driven:

1. `/api/availability?roomSlug=...` returns blocked/unavailable dates from `bookings` where status is `new`, `confirmed`, or `blocked`.
2. Booking UI disables these dates.
3. Booking API rejects overlaps server-side to prevent race-condition conflicts.
4. Admin can set booking statuses and add internal `blocked` date ranges from `/admin`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill the values.

```bash
cp .env.example .env.local
```

### Required

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Legacy/Optional

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BOOKINGS_TABLE` (default: `bookings`)
- `GOOGLE_APPS_SCRIPT_BOOKING_URL`

## Production Build

```bash
npm run build
npm run start
```

## Deploy to GCP (Cloud Run + Cloud SQL)

This repo now includes:

- `Dockerfile` for production container builds
- `cloudbuild.yaml` to build, push, and deploy to Cloud Run
- `.env.gcp.example` with Cloud SQL socket-based `DATABASE_URL`

The deployment settings are pre-wired for:

- Project: `thehillsideoasisweb`
- Region: `us-central1`
- Cloud Run service: `thehillsideoasis-web`
- Cloud SQL instance connection: `thehillsideoasisweb:us-central1:thehillsideoasis-web`

### 1) One-time GCP setup

```bash
gcloud config set project thehillsideoasisweb

gcloud services enable run.googleapis.com \
	cloudbuild.googleapis.com \
	artifactregistry.googleapis.com \
	sqladmin.googleapis.com

gcloud artifacts repositories create thehillsideoasis-web \
	--repository-format=docker \
	--location=us-central1 \
	--description="Docker repository for The HillSide Oasis"
```

### 2) Import schema + initial data into Cloud SQL

If you already created DB/user, import the SQL file only:

```bash
BUCKET=REPLACE_WITH_GCS_BUCKET

gsutil cp docker/postgres/init/001-init.sql gs://$BUCKET/001-init.sql

gcloud sql import sql thehillsideoasis-web gs://$BUCKET/001-init.sql \
	--database=postgres \
	--project=thehillsideoasisweb
```

### 3) Set Cloud Run environment variables

Set required app variables. Replace values as needed:

```bash
gcloud run services update thehillsideoasis-web \
	--region=us-central1 \
	--project=thehillsideoasisweb \
	--add-cloudsql-instances=thehillsideoasisweb:us-central1:thehillsideoasis-web \
	--set-env-vars="DATABASE_URL=postgres://thehillsideoasis:thehillsideoasis@/postgres?host=/cloudsql/thehillsideoasisweb:us-central1:thehillsideoasis-web,ADMIN_USERNAME=admin,ADMIN_PASSWORD=change-me,ADMIN_SESSION_SECRET=replace-with-a-long-random-secret"
```

You can also set SMTP variables for booking emails:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NOTIFY_EMAIL`

### 4) Deploy

From `thehillsideoasis-next/`:

```bash
gcloud builds submit --config cloudbuild.yaml
```

### 5) Verify database from Cloud SQL

```bash
gcloud sql connect thehillsideoasis-web \
	--project=thehillsideoasisweb \
	--user=thehillsideoasis \
	--database=postgres
```

Then run:

```sql
\dt
select count(*) from rooms;
select count(*) from activities;
select count(*) from gallery_items;
select count(*) from site_sections;
```

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
