import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/admin/purge-bookings/route";
import { COLLECTIONS, getDb } from "@/lib/firestore";

// This endpoint permanently deletes booking records, so it's covered
// separately from the booking-creation tests: wrong/missing secret must be
// rejected, dryRun must never delete, and only bookings past the 10-year
// retention window should ever be purged.

const ROOM_SLUG = "purge-test-room";
const SECRET = process.env.PURGE_API_SECRET!;

function purgeRequest(options: { secret?: string | null; dryRun?: boolean } = {}) {
  const url = new URL("http://localhost/api/admin/purge-bookings");
  if (options.dryRun) url.searchParams.set("dryRun", "true");

  const headers: Record<string, string> = {};
  if (options.secret !== null) {
    headers["x-purge-secret"] = options.secret ?? SECRET;
  }

  return new Request(url, { method: "POST", headers });
}

async function seedBooking(id: number, checkin: string, checkout: string) {
  const db = getDb();
  await db
    .collection(COLLECTIONS.bookings)
    .doc(String(id))
    .set({
      id,
      trace_id: `purge-test-${id}`,
      checkin,
      checkout,
      room_slug: ROOM_SLUG,
      room_price: 1000,
      total_amount: 1000,
      name: "Purge Test Guest",
      email: "purge-test@example.com",
      phone: "+91 90000 00000",
      guests: 1,
      requests: "",
      status: "confirmed",
      created_at: new Date().toISOString(),
    });
}

async function clearTestBookings() {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.bookings)
    .where("room_slug", "==", ROOM_SLUG)
    .get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

afterEach(async () => {
  await clearTestBookings();
});

describe("POST /api/admin/purge-bookings", () => {
  it("rejects requests with no secret header", async () => {
    const response = await POST(purgeRequest({ secret: null }));
    expect(response.status).toBe(401);
  });

  it("rejects requests with the wrong secret", async () => {
    const response = await POST(purgeRequest({ secret: "not-the-secret" }));
    expect(response.status).toBe(401);
  });

  it("dryRun reports the match count without deleting anything", async () => {
    await seedBooking(900_001, "2010-01-01", "2010-01-03");

    const response = await POST(purgeRequest({ dryRun: true }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.dryRun).toBe(true);
    expect(body.matched).toBeGreaterThanOrEqual(1);

    const db = getDb();
    const stillThere = await db.collection(COLLECTIONS.bookings).doc("900001").get();
    expect(stillThere.exists).toBe(true);
  });

  it("purges bookings past the 10-year retention window and keeps recent ones", async () => {
    await seedBooking(900_002, "2010-01-01", "2010-01-03"); // ~16 years old, should be purged
    await seedBooking(900_003, "2027-01-10", "2027-01-12"); // recent, must survive

    const response = await POST(purgeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.dryRun).toBe(false);
    expect(body.purged).toBeGreaterThanOrEqual(1);

    const db = getDb();
    const old = await db.collection(COLLECTIONS.bookings).doc("900002").get();
    const recent = await db.collection(COLLECTIONS.bookings).doc("900003").get();

    expect(old.exists).toBe(false);
    expect(recent.exists).toBe(true);

    await recent.ref.delete();
  });
});
