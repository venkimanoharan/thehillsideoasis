import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb, nextSequenceId } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const EXPENSE_CATEGORIES = [
  "Staff Wages",
  "Utilities",
  "Maintenance & Repairs",
  "Supplies & Groceries",
  "Marketing",
  "Taxes & Fees",
  "Other",
] as const;

type ExpenseRow = {
  id: number;
  date: string;
  category: string;
  amount: number;
  vendor: string | null;
  description: string;
  created_at: string;
};

/** Scoped to a date range so this never has to load the whole collection — same pattern as revenue. */
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
    .collection(COLLECTIONS.expenses)
    .where("date", ">=", start)
    .where("date", "<=", end)
    .get();

  const items = snapshot.docs
    .map((doc) => doc.data() as ExpenseRow)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return NextResponse.json({ ok: true, range: { start, end }, total, items });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    date: string;
    category: string;
    amount: number;
    vendor?: string | null;
    description?: string;
  };

  if (!body.date || !body.category || !Number.isFinite(body.amount) || body.amount <= 0) {
    return NextResponse.json(
      { ok: false, error: "date, category, and a positive amount are required." },
      { status: 400 },
    );
  }

  const db = getDb();
  const newId = await nextSequenceId("expenses");
  const newExpense: ExpenseRow = {
    id: newId,
    date: body.date,
    category: body.category,
    amount: body.amount,
    vendor: body.vendor?.trim() || null,
    description: body.description?.trim() ?? "",
    created_at: new Date().toISOString(),
  };

  await db.collection(COLLECTIONS.expenses).doc(String(newId)).set(newExpense);
  return NextResponse.json({ ok: true, item: newExpense });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ExpenseRow;
  const db = getDb();
  const ref = db.collection(COLLECTIONS.expenses).doc(String(body.id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Expense not found" }, { status: 404 });
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
  const ref = db.collection(COLLECTIONS.expenses).doc(String(id));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "Expense not found" }, { status: 404 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
