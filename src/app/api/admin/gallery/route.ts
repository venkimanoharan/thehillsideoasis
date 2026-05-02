
import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "gallery.json");

export const runtime = "nodejs";


export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    const items = JSON.parse(data);
    // Sort by sort_order ASC, then id ASC
    items.sort((a: any, b: any) => a.sort_order - b.sort_order || a.id - b.id);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: true, items: [] });
  }
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
  let items = [];
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    items = JSON.parse(data);
  } catch {}
  const newId = items.length > 0 ? Math.max(...items.map((a: any) => a.id || 0)) + 1 : 1;
  const newItem = { id: newId, ...body };
  items.push(newItem);
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json({ ok: true, item: newItem });
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
  let items = [];
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    items = JSON.parse(data);
  } catch {}
  const idx = items.findIndex((a: any) => a.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, error: "Gallery item not found" }, { status: 404 });
  }
  items[idx] = { ...items[idx], ...body };
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json({ ok: true, item: items[idx] });
}


export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = (await request.json()) as { id: number };
  let items = [];
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    items = JSON.parse(data);
  } catch {}
  const idx = items.findIndex((a: any) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, error: "Gallery item not found" }, { status: 404 });
  }
  items.splice(idx, 1);
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json({ ok: true });
}
