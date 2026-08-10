import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/booking/route";
import { COLLECTIONS, getDb } from "@/lib/firestore";

// Regression coverage for /api/booking: this endpoint has broken in production
// three separate times (undefined checkin/checkout vars, wrong Firestore
// project, wrong Firestore database ID), always in ways that unit tests over
// mocked Firestore calls would have missed. These run against the real
// Firestore emulator to catch the same class of wiring bug.

const ROOM_SLUG = "regression-test-room";
const ROOM_ID = 999_001;
const ROOM = {
  id: ROOM_ID,
  slug: ROOM_SLUG,
  name: "Regression Test Room",
  price_per_night: 1000,
  capacity: 2,
  bed: "1 Queen",
  view_label: "Garden View",
  sort_order: 999,
  is_active: true,
};

function bookingRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/booking", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    checkin: "2027-01-10",
    checkout: "2027-01-12",
    roomSlug: ROOM_SLUG,
    name: "Test Guest",
    email: "guest@example.com",
    phone: "+91 90000 00000",
    guests: 2,
    ...overrides,
  };
}

async function clearTestBookings() {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.bookings)
    .where("room_slug", "==", ROOM_SLUG)
    .get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

beforeAll(async () => {
  const db = getDb();
  await db.collection(COLLECTIONS.rooms).doc(String(ROOM_ID)).set(ROOM);
});

afterEach(async () => {
  await clearTestBookings();
});

afterAll(async () => {
  const db = getDb();
  await db.collection(COLLECTIONS.rooms).doc(String(ROOM_ID)).delete();
});

describe("POST /api/booking", () => {
  it("creates a booking with a server-computed price and persists it to Firestore", async () => {
    const response = await POST(bookingRequest(validPayload()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.traceId).toBeTypeOf("string");

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.bookings)
      .where("room_slug", "==", ROOM_SLUG)
      .where("trace_id", "==", body.traceId)
      .get();

    expect(snapshot.size).toBe(1);
    const saved = snapshot.docs[0]!.data();
    // 2027-01-10 -> 2027-01-12 is 2 nights at 1000/night.
    expect(saved.total_amount).toBe(2000);
    expect(saved.status).toBe("new");
    expect(saved.checkin).toBe("2027-01-10");
    expect(saved.checkout).toBe("2027-01-12");
  });

  it("rejects malformed JSON bodies", async () => {
    const request = new Request("http://localhost/api/booking", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("rejects a request missing required fields", async () => {
    const response = await POST(bookingRequest(validPayload({ email: "" })));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toContain("email");
  });

  it("rejects checkout on or before checkin", async () => {
    const response = await POST(
      bookingRequest(validPayload({ checkin: "2027-01-12", checkout: "2027-01-12" })),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/check-out/i);
  });

  it("rejects a booking for a room slug that does not exist", async () => {
    const response = await POST(bookingRequest(validPayload({ roomSlug: "does-not-exist" })));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/room/i);
  });

  it("rejects overlapping dates for the same room with a 409 conflict", async () => {
    const first = await POST(bookingRequest(validPayload()));
    expect(first.status).toBe(200);

    const overlapping = await POST(
      bookingRequest(validPayload({ checkin: "2027-01-11", checkout: "2027-01-13" })),
    );
    const body = await overlapping.json();

    expect(overlapping.status).toBe(409);
    expect(body.ok).toBe(false);
  });

  it("allows back-to-back bookings that only touch at the shared boundary date", async () => {
    const first = await POST(bookingRequest(validPayload()));
    expect(first.status).toBe(200);

    const adjacent = await POST(
      bookingRequest(validPayload({ checkin: "2027-01-12", checkout: "2027-01-14" })),
    );
    expect(adjacent.status).toBe(200);
  });
});
