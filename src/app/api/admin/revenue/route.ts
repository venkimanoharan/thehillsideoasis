import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { COLLECTIONS, getDb } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type BookingRow = {
  id: number;
  trace_id: string;
  checkin: string;
  checkout: string;
  room_slug: string;
  total_amount: number;
  name: string;
  email: string;
  phone: string;
  guests: number;
  requests: string | null;
  status: string;
  created_at: string;
};

type RoomRow = { slug: string; name: string };

/**
 * Revenue is attributed to the stay's check-in date, scoped to a date range so
 * this never has to load the whole bookings collection — the read cost stays
 * bounded no matter how many years of history accumulate.
 */
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

  const db = getDb();

  const [bookingsSnapshot, roomsSnapshot] = await Promise.all([
    db.collection(COLLECTIONS.bookings).where("checkin", ">=", start).where("checkin", "<=", end).get(),
    db.collection(COLLECTIONS.rooms).get(),
  ]);

  const roomNames = new Map<string, string>();
  for (const doc of roomsSnapshot.docs) {
    const room = doc.data() as RoomRow;
    roomNames.set(room.slug, room.name);
  }

  const bookings = bookingsSnapshot.docs
    .map((doc) => doc.data() as BookingRow)
    .filter((booking) => booking.status !== "blocked") // internal blocks aren't guest revenue
    .sort((a, b) => (a.checkin < b.checkin ? -1 : 1));

  let confirmedRevenue = 0;
  let pendingRevenue = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;
  const byRoomMap = new Map<string, { revenue: number; count: number }>();

  for (const booking of bookings) {
    if (booking.status === "cancelled") {
      cancelledCount += 1;
      continue;
    }

    if (booking.status === "confirmed") {
      confirmedRevenue += booking.total_amount;
      confirmedCount += 1;
    } else {
      pendingRevenue += booking.total_amount;
      pendingCount += 1;
    }

    const entry = byRoomMap.get(booking.room_slug) ?? { revenue: 0, count: 0 };
    entry.revenue += booking.total_amount;
    entry.count += 1;
    byRoomMap.set(booking.room_slug, entry);
  }

  const totalRevenue = confirmedRevenue + pendingRevenue;
  const totalCount = confirmedCount + pendingCount;

  const byRoom = Array.from(byRoomMap.entries())
    .map(([roomSlug, { revenue, count }]) => ({
      roomSlug,
      roomName: roomNames.get(roomSlug) ?? roomSlug,
      revenue,
      count,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({
    ok: true,
    range: { start, end },
    totals: {
      confirmedRevenue,
      pendingRevenue,
      totalRevenue,
      confirmedCount,
      pendingCount,
      cancelledCount,
      totalCount,
      averageBookingValue: totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0,
    },
    byRoom,
    bookings,
  });
}
