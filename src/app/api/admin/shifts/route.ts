import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ShiftRow = {
  id: number;
  staff_id: number;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes: string;
  status: string;
  created_at: string;
};

/** Scoped to a date range — same bounded-read pattern as revenue and expenses. */
export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { ok: false, error: "start and end are required (YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  const snapshot = await getDb()
    .collection(COLLECTIONS.shifts)
    .where("date", ">=", start)
    .where("date", "<=", end)
    .get();

  const items = snapshot.docs
    .map((doc) => doc.data() as ShiftRow)
    .sort((a, b) => (a.date === b.date ? a.start_time.localeCompare(b.start_time) : a.date < b.date ? 1 : -1));

  return NextResponse.json({ ok: true, range: { start, end }, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    staff_id: number;
    staff_name: string;
    date: string;
    start_time: string;
    end_time: string;
    role: string;
    notes?: string;
    status?: string;
  };

  if (!body.staff_id || !body.date || !body.start_time || !body.end_time) {
    return NextResponse.json(
      { ok: false, error: "staff, date, start time, and end time are required." },
      { status: 400 },
    );
  }

  const db = getDb();
  const newId = await nextSequenceId("shifts");
  const newShift: ShiftRow = {
    id: newId,
    staff_id: body.staff_id,
    staff_name: body.staff_name,
    date: body.date,
    start_time: body.start_time,
    end_time: body.end_time,
    role: body.role ?? "",
    notes: body.notes?.trim() ?? "",
    status: body.status ?? "scheduled",
    created_at: new Date().toISOString(),
  };

  await db.collection(COLLECTIONS.shifts).doc(String(newId)).set(newShift);
  return NextResponse.json({ ok: true, item: newShift });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ShiftRow;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.shifts).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Shift not found" }, { status: 404 });
  }

  await ref.set(body, { merge: true });
  const updated = await ref.get();
  return NextResponse.json({ ok: true, item: updated.data() });
}

export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await request.json()) as { id: number };
  const db = getDb();
  const ref = db.collection(COLLECTIONS.shifts).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Shift not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
