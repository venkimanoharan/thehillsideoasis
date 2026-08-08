import { sendBookingEmails } from "@/lib/email";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BookingPayload = {
  checkin: string;
  checkout: string;
  roomSlug: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  requests?: string;
};

const ACTIVE_STATUSES = ["new", "confirmed", "blocked"];

class BookingConflictError extends Error {}
class RoomNotFoundError extends Error {}

export async function POST(request: Request) {
  const traceId = crypto.randomUUID();

  let payload: BookingPayload;

  try {
    payload = (await request.json()) as BookingPayload;
  } catch {
    return NextResponse.json(
      { ok: false, traceId, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const requiredFields = [
    payload.checkin,
    payload.checkout,
    payload.roomSlug,
    payload.name,
    payload.email,
    payload.phone,
    payload.guests,
  ];

  const requiredFieldNames = [
    "checkin",
    "checkout",
    "roomSlug",
    "name",
    "email",
    "phone",
    "guests",
  ];

  const missingFields = requiredFields
    .map((value, idx) =>
      !value || String(value).trim().length === 0 ? requiredFieldNames[idx] : null,
    )
    .filter(Boolean);

  if (missingFields.length > 0) {
    return NextResponse.json(
      { ok: false, traceId, error: `Missing required booking fields: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  if (payload.checkout <= payload.checkin) {
    return NextResponse.json(
      { ok: false, traceId, error: "Check-out date must be after check-in date." },
      { status: 400 },
    );
  }

  const db = getDb();
  const newId = await nextSequenceId("bookings");
  const createdAt = new Date().toISOString();

  let roomName = payload.roomSlug;
  let totalAmount = 0;

  try {
    await db.runTransaction(async (tx) => {
      const roomQuery = db.collection(COLLECTIONS.rooms).where("slug", "==", payload.roomSlug).limit(1);
      const roomSnapshot = await tx.get(roomQuery);

      if (roomSnapshot.empty) {
        throw new RoomNotFoundError();
      }

      const room = roomSnapshot.docs[0]!.data() as { name: string; price_per_night: number };
      roomName = room.name;

      const nights = Math.ceil(
        (new Date(`${payload.checkout}T00:00:00Z`).getTime() -
          new Date(`${payload.checkin}T00:00:00Z`).getTime()) /
          86_400_000,
      );
      totalAmount = room.price_per_night * nights;

      const overlapQuery = db
        .collection(COLLECTIONS.bookings)
        .where("room_slug", "==", payload.roomSlug)
        .where("status", "in", ACTIVE_STATUSES);
      const overlapSnapshot = await tx.get(overlapQuery);

      const hasOverlap = overlapSnapshot.docs.some((doc) => {
        const booking = doc.data() as { checkin: string; checkout: string };
        return booking.checkin < payload.checkout && booking.checkout > payload.checkin;
      });

      if (hasOverlap) {
        throw new BookingConflictError();
      }

      const bookingRef = db.collection(COLLECTIONS.bookings).doc(String(newId));
      tx.set(bookingRef, {
        id: newId,
        trace_id: traceId,
        checkin: payload.checkin,
        checkout: payload.checkout,
        room_slug: payload.roomSlug,
        room_price: room.price_per_night,
        total_amount: totalAmount,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        guests: payload.guests,
        requests: payload.requests ?? "",
        status: "new",
        created_at: createdAt,
      });
    });
  } catch (error) {
    if (error instanceof RoomNotFoundError) {
      return NextResponse.json(
        { ok: false, traceId, error: "Selected room could not be found." },
        { status: 400 },
      );
    }

    if (error instanceof BookingConflictError) {
      return NextResponse.json(
        { ok: false, traceId, error: "Selected dates are not available for this room." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        traceId,
        error: "Booking could not be persisted. Please contact support.",
      },
      { status: 502 },
    );
  }

  // Send emails (fire-and-forget; booking is already saved so don't await errors)
  void sendBookingEmails({
    traceId,
    guestName: payload.name,
    guestEmail: payload.email,
    guestPhone: payload.phone,
    checkin: payload.checkin,
    checkout: payload.checkout,
    roomName,
    guests: payload.guests,
    totalAmount,
    requests: payload.requests,
  });

  return NextResponse.json({ ok: true, traceId }, { status: 200 });
}
