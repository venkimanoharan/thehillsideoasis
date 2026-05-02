import { sendBookingEmails } from "@/lib/email";
import { NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";

const BOOKINGS_PATH = path.join(process.cwd(), "data", "bookings.json");
const ROOMS_PATH = path.join(process.cwd(), "data", "rooms.json");

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

  // Check for overlapping bookings in file
  let bookings = [];
  try {
    const data = await fs.readFile(BOOKINGS_PATH, "utf-8");
    bookings = JSON.parse(data);
  } catch {}
  const overlap = bookings.find((b: any) =>
    b.room_slug === payload.roomSlug &&
    ["new", "confirmed", "blocked"].includes(b.status) &&
    new Date(b.checkin) < new Date(payload.checkout) &&
    new Date(b.checkout) > new Date(payload.checkin)
  );
  if (overlap) {
    return NextResponse.json(
      { ok: false, traceId, error: "Selected dates are not available for this room." },
      { status: 409 },
    );
  }

  // Save booking to file
  const newId = bookings.length > 0 ? Math.max(...bookings.map((b: any) => b.id || 0)) + 1 : 1;
  const createdAt = new Date().toISOString();
  const booking = {
    id: newId,
    trace_id: traceId,
    checkin: payload.checkin,
    checkout: payload.checkout,
    room_slug: payload.roomSlug,
    room_price: payload.roomPrice,
    total_amount: payload.totalAmount,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    guests: payload.guests,
    requests: payload.requests ?? "",
    status: "new",
    created_at: createdAt,
  };
  bookings.push(booking);
  try {
    await fs.writeFile(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));
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
    const data = await fs.readFile(ROOMS_PATH, "utf-8");
    const rooms = JSON.parse(data);
    const found = rooms.find((r: any) => r.slug === payload.roomSlug);
    if (found?.name) {
      roomName = found.name;
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
