import { dbQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BookingRange = {
  checkin: string;
  checkout: string;
};

const MS_PER_DAY = 86_400_000;

/** Returns today as "YYYY-MM-DD" in UTC, timezone-safe. */
function utcTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns "YYYY-MM-DD" for a date that is `months` months from today (UTC). */
function utcMonthsLater(months: number): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/**
 * Builds the list of individual dates (YYYY-MM-DD, exclusive of checkout)
 * that are occupied for a booking spanning [checkinStr, checkoutStr).
 * Uses pure UTC millisecond arithmetic — correct regardless of server timezone.
 */
function buildDateRange(checkinStr: string, checkoutStr: string): string[] {
  const dates: string[] = [];
  const startMs = new Date(checkinStr + "T00:00:00Z").getTime();
  const endMs = new Date(checkoutStr + "T00:00:00Z").getTime();

  for (let t = startMs; t < endMs; t += MS_PER_DAY) {
    dates.push(new Date(t).toISOString().slice(0, 10));
  }

  return dates;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomSlug = searchParams.get("roomSlug");

  if (!roomSlug) {
    return NextResponse.json({ ok: false, error: "roomSlug is required." }, { status: 400 });
  }

  const start = searchParams.get("start") ?? utcTodayStr();
  const end = searchParams.get("end") ?? utcMonthsLater(12);

  const result = await dbQuery<BookingRange>(
    `SELECT checkin::text, checkout::text
     FROM bookings
     WHERE room_slug = $1
       AND status IN ('new', 'confirmed', 'blocked')
       AND checkin < $3::date
       AND checkout > $2::date`,
    [roomSlug, start, end],
  );

  const unavailable = new Set<string>();

  for (const row of result.rows) {
    for (const date of buildDateRange(row.checkin, row.checkout)) {
      unavailable.add(date);
    }
  }

  return NextResponse.json({ ok: true, roomSlug, unavailableDates: [...unavailable].sort() });
}
