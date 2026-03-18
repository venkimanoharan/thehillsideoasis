import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { dbQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbQuery(
    `SELECT id, category, title, description, duration_label, price_label, distance_label, sort_order, is_active
     FROM activities ORDER BY sort_order ASC, id ASC`,
  );

  return NextResponse.json({ ok: true, items: result.rows });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    category: string;
    title: string;
    description: string;
    duration_label: string | null;
    price_label: string | null;
    distance_label: string | null;
    sort_order: number;
    is_active: boolean;
  };

  await dbQuery(
    `INSERT INTO activities (category, title, description, duration_label, price_label, distance_label, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      body.category,
      body.title,
      body.description,
      body.duration_label,
      body.price_label,
      body.distance_label,
      body.sort_order,
      body.is_active,
    ],
  );

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
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

  await dbQuery(
    `UPDATE activities
     SET category=$2, title=$3, description=$4, duration_label=$5, price_label=$6,
         distance_label=$7, sort_order=$8, is_active=$9, updated_at=NOW()
     WHERE id=$1`,
    [
      body.id,
      body.category,
      body.title,
      body.description,
      body.duration_label,
      body.price_label,
      body.distance_label,
      body.sort_order,
      body.is_active,
    ],
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await request.json()) as { id: number };
  await dbQuery(`DELETE FROM activities WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}
