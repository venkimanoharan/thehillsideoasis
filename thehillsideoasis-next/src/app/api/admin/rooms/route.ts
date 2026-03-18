import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { dbQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await dbQuery(
    `SELECT id, slug, name, capacity, bed, view_label, description, amenities, price_per_night, image_url, sort_order, is_active
     FROM rooms ORDER BY sort_order ASC, id ASC`,
  );

  return NextResponse.json({ ok: true, items: result.rows });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
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

  await dbQuery(
    `INSERT INTO rooms (slug, name, capacity, bed, view_label, description, amenities, price_per_night, image_url, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      body.slug,
      body.name,
      body.capacity,
      body.bed,
      body.view_label,
      body.description,
      body.amenities,
      body.price_per_night,
      body.image_url,
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

  await dbQuery(
    `UPDATE rooms
     SET slug=$2, name=$3, capacity=$4, bed=$5, view_label=$6, description=$7, amenities=$8,
         price_per_night=$9, image_url=$10, sort_order=$11, is_active=$12, updated_at=NOW()
     WHERE id=$1`,
    [
      body.id,
      body.slug,
      body.name,
      body.capacity,
      body.bed,
      body.view_label,
      body.description,
      body.amenities,
      body.price_per_night,
      body.image_url,
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
  await dbQuery(`DELETE FROM rooms WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}
