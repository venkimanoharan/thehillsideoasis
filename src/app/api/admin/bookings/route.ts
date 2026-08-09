import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { sendBookingStatusEmail } from "@/lib/email";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BookingRow = {
  id: number;
  trace_id: string;
  checkin: string;
  checkout: string;
  room_slug: string;
  total_amount: number;
  name: string;
  email: string;
  phone: string;
  guests: number;
  requests: string | null;
  status: string;
  created_at: string;
};

/** Best-effort: booking status change already succeeded regardless of email outcome. */
async function notifyStatusChange(booking: BookingRow, status: "confirmed" | "cancelled") {
  try {
    const db = getDb();
    let roomName = booking.room_slug;
    const roomSnapshot = await db
      .collection(COLLECTIONS.rooms)
      .where("slug", "==", booking.room_slug)
      .limit(1)
      .get();

    if (!roomSnapshot.empty) {
      const room = roomSnapshot.docs[0]!.data() as { name?: string };
      roomName = room.name ?? roomName;
    }

    await sendBookingStatusEmail(
      {
        traceId: booking.trace_id,
        guestName: booking.name,
        guestEmail: booking.email,
        guestPhone: booking.phone,
        checkin: booking.checkin,
        checkout: booking.checkout,
        roomName,
        guests: booking.guests,
        totalAmount: booking.total_amount,
        requests: booking.requests ?? undefined,
      },
      status,
    );
  } catch {
    // Swallow — the status update itself already committed successfully.
  }
}

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDb().collection(COLLECTIONS.bookings).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as BookingRow)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ ok: true, items });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id: number; status: string };
  const db = getDb();
  const ref = db.collection(COLLECTIONS.bookings).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  const previous = snapshot.data() as BookingRow;
  await ref.update({ status: body.status });
  const updated = await ref.get();
  const updatedBooking = updated.data() as BookingRow;

  if (
    (body.status === "confirmed" || body.status === "cancelled") &&
    body.status !== previous.status &&
    updatedBooking.email
  ) {
    // Fire-and-forget: don't block the admin's status update on email delivery.
    void notifyStatusChange(updatedBooking, body.status);
  }

  return NextResponse.json({ ok: true, item: updatedBooking });
}

/** Creates an internal "blocked" date range so it appears as unavailable to guests. */
export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    roomSlug: string;
    checkin: string;
    checkout: string;
    note?: string;
  };

  if (!body.roomSlug || !body.checkin || !body.checkout) {
    return NextResponse.json(
      { ok: false, error: "roomSlug, checkin, and checkout are required." },
      { status: 400 },
    );
  }

  if (body.checkout <= body.checkin) {
    return NextResponse.json(
      { ok: false, error: "Check-out date must be after check-in date." },
      { status: 400 },
    );
  }

  const db = getDb();
  const newId = await nextSequenceId("bookings");
  const createdAt = new Date().toISOString();

  const newBooking: BookingRow = {
    id: newId,
    trace_id: crypto.randomUUID(),
    checkin: body.checkin,
    checkout: body.checkout,
    room_slug: body.roomSlug,
    total_amount: 0,
    name: "Blocked (Admin)",
    email: "",
    phone: "",
    guests: 0,
    requests: body.note ?? null,
    status: "blocked",
    created_at: createdAt,
  };

  await db.collection(COLLECTIONS.bookings).doc(String(newId)).set(newBooking);

  return NextResponse.json({ ok: true, item: newBooking });
}
