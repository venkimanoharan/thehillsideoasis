import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const STAFF_ROLES = [
  "Manager",
  "Housekeeping",
  "Cook",
  "Caretaker",
  "Security",
  "Gardener",
  "Other",
] as const;

type StaffRow = {
  id: number;
  name: string;
  role: string;
  phone: string;
  is_active: boolean;
  created_at: string;
};

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDb().collection(COLLECTIONS.staff).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as StaffRow)
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name: string; role: string; phone?: string };

  if (!body.name?.trim() || !body.role?.trim()) {
    return NextResponse.json({ ok: false, error: "Name and role are required." }, { status: 400 });
  }

  const db = getDb();
  const newId = await nextSequenceId("staff");
  const newStaff: StaffRow = {
    id: newId,
    name: body.name.trim(),
    role: body.role,
    phone: body.phone?.trim() ?? "",
    is_active: true,
    created_at: new Date().toISOString(),
  };

  await db.collection(COLLECTIONS.staff).doc(String(newId)).set(newStaff);
  return NextResponse.json({ ok: true, item: newStaff });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as StaffRow;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.staff).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Staff member not found" }, { status: 404 });
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
  const ref = db.collection(COLLECTIONS.staff).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Staff member not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
