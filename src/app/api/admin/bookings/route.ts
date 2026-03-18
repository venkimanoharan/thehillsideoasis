import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { dbQuery } from "@/lib/db";
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

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbQuery<BookingRow>(
    `SELECT id, trace_id::text, checkin::text, checkout::text, room_slug, total_amount,
            name, email, phone, guests, requests, status, created_at::text
     FROM bookings
     ORDER BY created_at DESC`,
  );

  return NextResponse.json({ ok: true, items: result.rows });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: number;
    status: string;
  };

  await dbQuery(
    `UPDATE bookings
     SET status = $2
     WHERE id = $1`,
    [body.id, body.status],
  );

  return NextResponse.json({ ok: true });
}

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
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  await dbQuery(
    `INSERT INTO bookings (trace_id, checkin, checkout, room_slug, room_price, total_amount, name, email, phone, guests, requests, status)
     VALUES ($1,$2,$3,$4,0,0,'Availability Block','internal@thehillsideoasis.com','N/A',0,$5,'blocked')`,
    [crypto.randomUUID(), body.checkin, body.checkout, body.roomSlug, body.note ?? "Blocked from admin"],
  );

  return NextResponse.json({ ok: true });
}
