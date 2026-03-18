"use client";

import { useEffect, useMemo, useState } from "react";

type RoomItem = {
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

type ActivityItem = {
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

type GalleryItem = {
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
};

type BookingItem = {
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

type TabKey = "rooms" | "activities" | "gallery" | "bookings";

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function statusPriority(status: string) {
  if (status === "blocked") {
    return 4;
  }

  if (status === "confirmed") {
    return 3;
  }

  if (status === "new") {
    return 2;
  }

  return 1;
}

function statusPillClass(status: string) {
  if (status === "blocked") {
    return "bg-rose-100 text-rose-700 border border-rose-300";
  }

  if (status === "confirmed") {
    return "bg-orange-100 text-[#9e3e12] border border-orange-200";
  }

  if (status === "new") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

function dayCellClass(status?: string) {
  if (status === "blocked") {
    return "border-rose-300 bg-rose-100 text-rose-700";
  }

  if (status === "confirmed") {
    return "border-orange-300 bg-orange-100 text-[#9e3e12]";
  }

  if (status === "new") {
    return "border-amber-300 bg-amber-100 text-amber-800";
  }

  if (status === "cancelled") {
    return "border-zinc-200 bg-zinc-50 text-zinc-500";
  }

  return "border-zinc-200 bg-white text-zinc-700";
}

export default function AdminDashboardClient() {
  const [tab, setTab] = useState<TabKey>("rooms");
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [blockRoom, setBlockRoom] = useState<string>("");
  const [calendarRoom, setCalendarRoom] = useState<string>("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [blockCheckin, setBlockCheckin] = useState<string>("");
  const [blockCheckout, setBlockCheckout] = useState<string>("");
  const [blockNote, setBlockNote] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function fetchData() {
    const [roomsRes, activitiesRes, galleryRes, bookingsRes] = await Promise.all([
      fetch("/api/admin/rooms", { cache: "no-store" }),
      fetch("/api/admin/activities", { cache: "no-store" }),
      fetch("/api/admin/gallery", { cache: "no-store" }),
      fetch("/api/admin/bookings", { cache: "no-store" }),
    ]);

    if (!roomsRes.ok || !activitiesRes.ok || !galleryRes.ok || !bookingsRes.ok) {
      throw new Error("Failed to load admin data.");
    }

    const roomsData = (await roomsRes.json()) as { items: RoomItem[] };
    const activitiesData = (await activitiesRes.json()) as { items: ActivityItem[] };
    const galleryData = (await galleryRes.json()) as { items: GalleryItem[] };
    const bookingsData = (await bookingsRes.json()) as { items: BookingItem[] };

    setRooms(roomsData.items);
    setActivities(activitiesData.items);
    setGallery(galleryData.items);
    setBookings(bookingsData.items);

    if (!blockRoom && roomsData.items[0]?.slug) {
      setBlockRoom(roomsData.items[0].slug);
    }

    if (!calendarRoom && roomsData.items[0]?.slug) {
      setCalendarRoom(roomsData.items[0].slug);
    }
  }

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(calendarMonth);
  }, [calendarMonth]);

  const calendarCells = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const leadingEmpty = start.getDay();

    const cells: Array<{ type: "empty" } | { type: "day"; date: Date }> = [];

    for (let i = 0; i < leadingEmpty; i += 1) {
      cells.push({ type: "empty" });
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
      cells.push({
        type: "day",
        date: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day),
      });
    }

    return cells;
  }, [calendarMonth]);

  const calendarStatusMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const booking of bookings) {
      if (!calendarRoom || booking.room_slug !== calendarRoom) {
        continue;
      }

      const start = new Date(booking.checkin);
      const end = new Date(booking.checkout);
      const cursor = new Date(start);

      while (cursor < end) {
        const key = toDateKey(cursor);
        const existing = map.get(key);

        if (!existing || statusPriority(booking.status) > statusPriority(existing)) {
          map.set(key, booking.status);
        }

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return map;
  }, [bookings, calendarRoom]);

  useEffect(() => {
    fetchData().catch(() => {
      setMessage("Unable to load admin data.");
    });
  }, []);

  async function saveRoom(item: RoomItem) {
    const response = await fetch("/api/admin/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Room update failed.");
      return;
    }

    setMessage("Room updated.");
    await fetchData();
  }

  async function saveActivity(item: ActivityItem) {
    const response = await fetch("/api/admin/activities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Activity update failed.");
      return;
    }

    setMessage("Activity updated.");
    await fetchData();
  }

  async function saveGallery(item: GalleryItem) {
    const response = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Gallery update failed.");
      return;
    }

    setMessage("Gallery item updated.");
    await fetchData();
  }

  async function saveBookingStatus(item: BookingItem, status: string) {
    const response = await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status }),
    });

    if (!response.ok) {
      setMessage("Booking update failed.");
      return;
    }

    setMessage("Booking status updated.");
    await fetchData();
  }

  async function createAvailabilityBlock() {
    if (!blockRoom || !blockCheckin || !blockCheckout) {
      setMessage("Please select room, check-in and check-out for blocking.");
      return;
    }

    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomSlug: blockRoom,
        checkin: blockCheckin,
        checkout: blockCheckout,
        note: blockNote,
      }),
    });

    if (!response.ok) {
      setMessage("Failed to create availability block.");
      return;
    }

    setMessage("Availability blocked successfully.");
    setBlockCheckin("");
    setBlockCheckout("");
    setBlockNote("");
    await fetchData();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <section className="mx-auto max-w-[84rem] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-zinc-900">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-zinc-500"
        >
          Logout
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["rooms", "activities", "gallery", "bookings"] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === key ? "bg-[#c45e2a] text-white" : "border border-zinc-300 text-zinc-700",
            ].join(" ")}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-[#9e3e12]">{message}</p> : null}

      {tab === "rooms" ? (
        <div className="mt-6 grid gap-4">
          {rooms.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={item.name}
                  onChange={(event) =>
                    setRooms((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, name: event.target.value } : entry,
                      ),
                    )
                  }
                  className="rounded-xl border border-zinc-300 px-3 py-2"
                />
                <input
                  value={item.price_per_night}
                  onChange={(event) =>
                    setRooms((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, price_per_night: Number(event.target.value) || 0 } : entry,
                      ),
                    )
                  }
                  className="rounded-xl border border-zinc-300 px-3 py-2"
                  type="number"
                />
              </div>
              <textarea
                value={item.description}
                onChange={(event) =>
                  setRooms((prev) =>
                    prev.map((entry) => (entry.id === item.id ? { ...entry, description: event.target.value } : entry)),
                  )
                }
                className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2"
                rows={3}
              />
              <button
                onClick={() => saveRoom(item)}
                className="mt-3 rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Save Room
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "activities" ? (
        <div className="mt-6 grid gap-4">
          {activities.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
              <input
                value={item.title}
                onChange={(event) =>
                  setActivities((prev) =>
                    prev.map((entry) => (entry.id === item.id ? { ...entry, title: event.target.value } : entry)),
                  )
                }
                className="w-full rounded-xl border border-zinc-300 px-3 py-2"
              />
              <textarea
                value={item.description}
                onChange={(event) =>
                  setActivities((prev) =>
                    prev.map((entry) =>
                      entry.id === item.id ? { ...entry, description: event.target.value } : entry,
                    ),
                  )
                }
                className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2"
                rows={3}
              />
              <button
                onClick={() => saveActivity(item)}
                className="mt-3 rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Save Activity
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "gallery" ? (
        <div className="mt-6 grid gap-4">
          {gallery.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
              <input
                value={item.image_url}
                onChange={(event) =>
                  setGallery((prev) =>
                    prev.map((entry) => (entry.id === item.id ? { ...entry, image_url: event.target.value } : entry)),
                  )
                }
                className="w-full rounded-xl border border-zinc-300 px-3 py-2"
              />
              <input
                value={item.alt_text}
                onChange={(event) =>
                  setGallery((prev) =>
                    prev.map((entry) => (entry.id === item.id ? { ...entry, alt_text: event.target.value } : entry)),
                  )
                }
                className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2"
              />
              <button
                onClick={() => saveGallery(item)}
                className="mt-3 rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Save Image
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "bookings" ? (
        <div className="mt-6 grid gap-6">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900">Availability Calendar</h2>
              <select
                value={calendarRoom}
                onChange={(event) => setCalendarRoom(event.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.slug}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                  )
                }
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-semibold"
              >
                Prev
              </button>
              <p className="text-sm font-semibold text-zinc-800">{monthLabel}</p>
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                  )
                }
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-semibold"
              >
                Next
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs">
              {dayHeaders.map((day) => (
                <div key={day} className="rounded-lg bg-zinc-200 py-1 font-semibold text-zinc-700">
                  {day}
                </div>
              ))}

              {calendarCells.map((cell, index) => {
                if (cell.type === "empty") {
                  return <div key={`empty-${index}`} className="aspect-square rounded-lg bg-zinc-100" />;
                }

                const key = toDateKey(cell.date);
                const status = calendarStatusMap.get(key);

                return (
                  <div
                    key={key}
                    className={[
                      "aspect-square rounded-lg border text-sm font-semibold grid place-items-center",
                      dayCellClass(status),
                    ].join(" ")}
                    title={status ? `Status: ${status}` : "Available"}
                  >
                    {cell.date.getDate()}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-3 py-1 border border-zinc-200">Available</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 border border-amber-200 text-amber-700">New</span>
              <span className="rounded-full bg-orange-100 px-3 py-1 border border-orange-200 text-[#9e3e12]">Confirmed</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 border border-rose-300 text-rose-700">Blocked</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 border border-zinc-200 text-zinc-600">Cancelled</span>
            </div>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h2 className="text-lg font-semibold text-[#9e3e12]">Block Availability</h2>
            <p className="mt-1 text-sm text-[#9e3e12]">
              Create an internal blocked slot for maintenance, events, or owner use.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={blockRoom}
                onChange={(event) => setBlockRoom(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.slug}>
                    {room.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={blockCheckin}
                onChange={(event) => setBlockCheckin(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2"
              />
              <input
                type="date"
                value={blockCheckout}
                onChange={(event) => setBlockCheckout(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2"
              />
              <button
                onClick={createAvailabilityBlock}
                className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Block Dates
              </button>
            </div>
            <input
              value={blockNote}
              onChange={(event) => setBlockNote(event.target.value)}
              placeholder="Optional note"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </article>

          <div className="grid gap-4">
            {bookings.map((item) => (
              <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.room_slug} | {item.checkin} to {item.checkout}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {item.name} ({item.email}) | Guests: {item.guests} | Total: INR {item.total_amount}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">Ref: {item.trace_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={["rounded-full px-2 py-1 text-xs font-semibold", statusPillClass(item.status)].join(" ")}>
                      {item.status}
                    </span>
                    <select
                      value={item.status}
                      onChange={(event) => saveBookingStatus(item, event.target.value)}
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                    >
                      <option value="new">new</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="blocked">blocked</option>
                    </select>
                  </div>
                </div>
                {item.requests ? <p className="mt-2 text-xs text-zinc-700">Note: {item.requests}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
