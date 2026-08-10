import { timingSafeEqual } from "crypto";
import { COLLECTIONS, getDb } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RETENTION_YEARS = 10;
const BATCH_SIZE = 500;

/**
 * Cloud Scheduler calls this on a cron, not an interactive admin session, so
 * it authenticates with its own shared secret rather than the cookie-based
 * admin session. Fails closed if the secret isn't configured — no bypass.
 */
function isPurgeRequestAuthorized(request: Request): boolean {
  const secret = process.env.PURGE_API_SECRET;
  if (!secret) {
    return false;
  }

  const provided = request.headers.get("x-purge-secret");
  if (!provided) {
    return false;
  }

  const secretBuffer = Buffer.from(secret);
  const providedBuffer = Buffer.from(provided);
  if (secretBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(secretBuffer, providedBuffer);
}

function retentionCutoff(): string {
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - RETENTION_YEARS);
  return cutoff.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  if (!isPurgeRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";
  const cutoff = retentionCutoff();

  const db = getDb();
  const snapshot = await db.collection(COLLECTIONS.bookings).where("checkout", "<", cutoff).get();
  const docs = snapshot.docs;

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, cutoff, matched: docs.length });
  }

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + BATCH_SIZE)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }

  return NextResponse.json({ ok: true, dryRun: false, cutoff, purged: docs.length });
}
