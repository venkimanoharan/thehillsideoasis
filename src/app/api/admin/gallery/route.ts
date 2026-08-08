import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GalleryRow = {
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
};

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDb().collection(COLLECTIONS.gallery).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as GalleryRow)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<GalleryRow, "id">;
  const db = getDb();
  const newId = await nextSequenceId("gallery");
  const newItem: GalleryRow = { id: newId, ...body };

  await db.collection(COLLECTIONS.gallery).doc(String(newId)).set(newItem);
  return NextResponse.json({ ok: true, item: newItem });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as GalleryRow;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.gallery).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Gallery item not found" }, { status: 404 });
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
  const ref = db.collection(COLLECTIONS.gallery).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Gallery item not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
