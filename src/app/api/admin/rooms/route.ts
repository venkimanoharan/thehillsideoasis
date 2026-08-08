import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RoomRow = {
  id: number;
  slug: string;
  name: string;
  capacity: string;
  bed: string;
  view_label: string;
  description: string;
  amenities: string[];
  price_per_night: number;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDb().collection(COLLECTIONS.rooms).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as RoomRow)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<RoomRow, "id">;
  const db = getDb();
  const newId = await nextSequenceId("rooms");
  const newRoom: RoomRow = { id: newId, ...body };

  await db.collection(COLLECTIONS.rooms).doc(String(newId)).set(newRoom);
  return NextResponse.json({ ok: true, item: newRoom });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as RoomRow;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.rooms).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Room not found" }, { status: 404 });
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
  const ref = db.collection(COLLECTIONS.rooms).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Room not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
