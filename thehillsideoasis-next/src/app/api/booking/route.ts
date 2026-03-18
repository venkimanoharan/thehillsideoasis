import { dbQuery } from "@/lib/db";
import { sendBookingEmails } from "@/lib/email";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BookingPayload = {
  checkin: string;
  checkout: string;
  roomSlug: string;
  roomPrice: number;
  totalAmount: number;
  name: string;
  email: string;
  phone: string;
  guests: number;
  requests?: string;
};

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

  if (requiredFields.some((value) => !value || String(value).trim().length === 0)) {
    return NextResponse.json(
      { ok: false, traceId, error: "Missing required booking fields." },
      { status: 400 },
    );
  }

  const checkinDate = new Date(payload.checkin);
  const checkoutDate = new Date(payload.checkout);

  if (!(checkinDate < checkoutDate)) {
    return NextResponse.json(
      { ok: false, traceId, error: "Check-out date must be after check-in date." },
      { status: 400 },
    );
  }

  const overlapResult = await dbQuery<{ id: number }>(
    `SELECT id
     FROM bookings
     WHERE room_slug = $1
       AND status IN ('new', 'confirmed', 'blocked')
       AND checkin < $3::date
       AND checkout > $2::date
     LIMIT 1`,
    [payload.roomSlug, payload.checkin, payload.checkout],
  );

  if (overlapResult.rows.length > 0) {
    return NextResponse.json(
      { ok: false, traceId, error: "Selected dates are not available for this room." },
      { status: 409 },
    );
  }

  try {
    await dbQuery(
      `INSERT INTO bookings (trace_id, checkin, checkout, room_slug, room_price, total_amount, name, email, phone, guests, requests)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        traceId,
        payload.checkin,
        payload.checkout,
        payload.roomSlug,
        payload.roomPrice,
        payload.totalAmount,
        payload.name,
        payload.email,
        payload.phone,
        payload.guests,
        payload.requests ?? "",
      ],
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        traceId,
        error: "Booking could not be persisted. Please contact support.",
      },
      { status: 502 },
    );
  }

  // Fetch room name for the confirmation email (best-effort, don't fail the booking)
  let roomName = payload.roomSlug;
  try {
    const roomResult = await dbQuery<{ name: string }>(
      `SELECT name FROM rooms WHERE slug = $1 LIMIT 1`,
      [payload.roomSlug],
    );
    if (roomResult.rows[0]?.name) {
      roomName = roomResult.rows[0].name;
    }
  } catch {
    // ignore — roomName falls back to slug
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
    totalAmount: payload.totalAmount,
    requests: payload.requests,
  });

  return NextResponse.json({ ok: true, traceId }, { status: 200 });
}
