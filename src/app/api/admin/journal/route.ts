import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import type { JournalPost } from "@/lib/journal";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDb().collection(COLLECTIONS.journalPosts).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as JournalPost)
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<JournalPost, "id">;
  const db = getDb();
  const newId = await nextSequenceId("journal_posts");

  // Support the "create blank, edit inline, save" flow used by rooms/activities/gallery —
  // default to a unique slug/title rather than requiring them upfront.
  const slug = body.slug || `draft-${newId}`;
  const title = body.title || "Untitled Post";

  const existing = await db.collection(COLLECTIONS.journalPosts).where("slug", "==", slug).limit(1).get();
  if (!existing.empty) {
    return NextResponse.json({ ok: false, error: "A post with this slug already exists." }, { status: 409 });
  }

  const newPost: JournalPost = { ...body, id: newId, slug, title };

  await db.collection(COLLECTIONS.journalPosts).doc(String(newId)).set(newPost);
  return NextResponse.json({ ok: true, item: newPost });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as JournalPost;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.journalPosts).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Journal post not found" }, { status: 404 });
  }

  if (body.slug) {
    const clash = await db
      .collection(COLLECTIONS.journalPosts)
      .where("slug", "==", body.slug)
      .get();
    const clashesWithOther = clash.docs.some((doc) => doc.id !== String(body.id));
    if (clashesWithOther) {
      return NextResponse.json({ ok: false, error: "A post with this slug already exists." }, { status: 409 });
    }
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
  const ref = db.collection(COLLECTIONS.journalPosts).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Journal post not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
