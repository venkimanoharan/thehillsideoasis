import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ActivityRow = {
  id: number;
  category: string;
  title: string;
  description: string;
  duration_label: string | null;
  price_label: string | null;
  distance_label: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDb().collection(COLLECTIONS.activities).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as ActivityRow)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<ActivityRow, "id">;
  const db = getDb();
  const newId = await nextSequenceId("activities");
  const newActivity: ActivityRow = { id: newId, ...body };

  await db.collection(COLLECTIONS.activities).doc(String(newId)).set(newActivity);
  return NextResponse.json({ ok: true, item: newActivity });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ActivityRow;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.activities).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Activity not found" }, { status: 404 });
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
  const ref = db.collection(COLLECTIONS.activities).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Activity not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
