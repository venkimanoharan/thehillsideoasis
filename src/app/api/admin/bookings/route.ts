
import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "bookings.json");

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
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    const items = JSON.parse(data);
    // Sort by created_at DESC
    items.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: true, items: [] });
  }
}


export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    id: number;
    status: string;
  };
  let items = [];
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    items = JSON.parse(data);
  } catch {}
  const idx = items.findIndex((b: any) => b.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }
  items[idx].status = body.status;
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json({ ok: true, item: items[idx] });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
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
  let items = [];
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    items = JSON.parse(data);
  } catch {}
  const newId = items.length > 0 ? Math.max(...items.map((b: any) => b.id || 0)) + 1 : 1;
  const newBooking = { id: newId, ...body };
  items.push(newBooking);
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json({ ok: true, item: newBooking });
}
