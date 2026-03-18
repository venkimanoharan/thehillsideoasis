import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { dbQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbQuery(
    `SELECT id, image_url, alt_text, sort_order, is_active
     FROM gallery_items ORDER BY sort_order ASC, id ASC`,
  );

  return NextResponse.json({ ok: true, items: result.rows });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_active: boolean;
  };

  await dbQuery(
    `INSERT INTO gallery_items (image_url, alt_text, sort_order, is_active)
     VALUES ($1,$2,$3,$4)`,
    [body.image_url, body.alt_text, body.sort_order, body.is_active],
  );

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id: number;
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_active: boolean;
  };

  await dbQuery(
    `UPDATE gallery_items
     SET image_url=$2, alt_text=$3, sort_order=$4, is_active=$5, updated_at=NOW()
     WHERE id=$1`,
    [body.id, body.image_url, body.alt_text, body.sort_order, body.is_active],
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await request.json()) as { id: number };
  await dbQuery(`DELETE FROM gallery_items WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}
